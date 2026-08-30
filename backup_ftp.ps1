param(
    [string]$FtpHost = 'ftpupload.net',
    [string]$RemotePath = 'lostopal.com/htdocs',
    [Parameter(Mandatory = $true)][string]$Destination,
    [string]$PathsFromDirectory = '',
    [string[]]$RelativePaths = @(),
    [string]$ReuseFromDirectory = '',
    [string]$CacheDirectory = '',
    [switch]$Full,
    [string]$CredentialTarget = 'LostOpalTarot-FTP',
    [string]$Username = $env:LOST_OPAL_FTP_USER,
    [string]$Password = $env:LOST_OPAL_FTP_PASS
)

$ErrorActionPreference = 'Stop'

function Get-WindowsGenericCredential([string]$Target) {
    if (-not ('LostOpal.BackupCredentialReader' -as [type])) {
        Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;

namespace LostOpal {
    public static class BackupCredentialReader {
        [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
        private struct NativeCredential {
            public uint Flags;
            public uint Type;
            public IntPtr TargetName;
            public IntPtr Comment;
            public System.Runtime.InteropServices.ComTypes.FILETIME LastWritten;
            public uint CredentialBlobSize;
            public IntPtr CredentialBlob;
            public uint Persist;
            public uint AttributeCount;
            public IntPtr Attributes;
            public IntPtr TargetAlias;
            public IntPtr UserName;
        }

        [DllImport("advapi32.dll", EntryPoint = "CredReadW", CharSet = CharSet.Unicode, SetLastError = true)]
        private static extern bool CredRead(string target, uint type, uint flags, out IntPtr credential);

        [DllImport("advapi32.dll", SetLastError = true)]
        private static extern void CredFree(IntPtr credential);

        public static string[] Read(string target) {
            IntPtr pointer;
            if (!CredRead(target, 1, 0, out pointer)) return null;
            try {
                NativeCredential credential = Marshal.PtrToStructure<NativeCredential>(pointer);
                string username = Marshal.PtrToStringUni(credential.UserName);
                string password = credential.CredentialBlob == IntPtr.Zero
                    ? string.Empty
                    : Marshal.PtrToStringUni(credential.CredentialBlob, (int)credential.CredentialBlobSize / 2);
                return new[] { username, password };
            }
            finally {
                CredFree(pointer);
            }
        }
    }
}
'@
    }

    $stored = [LostOpal.BackupCredentialReader]::Read($Target)
    if ($null -eq $stored -or $stored.Count -lt 2) { return $null }
    return [pscustomobject]@{ Username = $stored[0]; Password = $stored[1] }
}

if ([string]::IsNullOrWhiteSpace($Username) -or [string]::IsNullOrWhiteSpace($Password)) {
    $storedCredential = Get-WindowsGenericCredential $CredentialTarget
    if ($null -ne $storedCredential) {
        $Username = $storedCredential.Username
        $Password = $storedCredential.Password
    }
}

if ([string]::IsNullOrWhiteSpace($Username) -or [string]::IsNullOrWhiteSpace($Password)) {
    throw 'FTP credentials were not found in the environment or Windows Credential Manager.'
}

function Encode-RemotePath([string]$Path) {
    return (($Path -split '/') | Where-Object { $_ -ne '' } | ForEach-Object {
        [Uri]::EscapeDataString($_)
    }) -join '/'
}

function Get-FtpUrl([string]$Path, [bool]$IsDirectory = $false) {
    $encoded = Encode-RemotePath $Path
    $url = "ftp://$FtpHost/$encoded"
    if ($IsDirectory -and -not $url.EndsWith('/')) { $url += '/' }
    return $url
}

function Invoke-Curl([string[]]$Arguments) {
    & curl.exe --silent --show-error --fail --user "${Username}:$Password" @Arguments
    if ($LASTEXITCODE -ne 0) { throw "curl failed with exit code $LASTEXITCODE" }
}

function Get-RemoteManifest {
    $temporaryFile = [IO.Path]::GetTempFileName()
    try {
        & curl.exe --silent --fail --user "${Username}:$Password" --output $temporaryFile (Get-FtpUrl "$($RemotePath.TrimEnd('/'))/.deployment-manifest.json")
        if ($LASTEXITCODE -ne 0) { return $null }
        return Get-Content -LiteralPath $temporaryFile -Raw | ConvertFrom-Json
    }
    finally {
        if (Test-Path -LiteralPath $temporaryFile) { Remove-Item -LiteralPath $temporaryFile -Force }
    }
}

function Get-FileSha256([string]$Path) {
    return (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash.ToLowerInvariant()
}

function Add-BackupLink([string]$Source, [string]$DestinationPath) {
    $parent = Split-Path -Parent $DestinationPath
    New-Item -ItemType Directory -Path $parent -Force | Out-Null
    if (Test-Path -LiteralPath $DestinationPath) { Remove-Item -LiteralPath $DestinationPath -Force }

    try {
        New-Item -ItemType HardLink -Path $DestinationPath -Target $Source -ErrorAction Stop | Out-Null
        return 'hardlink'
    }
    catch {
        Copy-Item -LiteralPath $Source -Destination $DestinationPath -Force
        return 'copy'
    }
}

function Find-ReusableFile([string]$RelativePath, [string]$ExpectedHash, [string]$SearchRoot, [string]$ExcludedDirectory) {
    if ([string]::IsNullOrWhiteSpace($ExpectedHash) -or
        [string]::IsNullOrWhiteSpace($SearchRoot) -or
        -not (Test-Path -LiteralPath $SearchRoot -PathType Container)) {
        return $null
    }

    $excluded = if ([string]::IsNullOrWhiteSpace($ExcludedDirectory)) { '' } else { [IO.Path]::GetFullPath($ExcludedDirectory).TrimEnd('\') }
    foreach ($backupDirectory in (Get-ChildItem -LiteralPath $SearchRoot -Directory | Sort-Object LastWriteTime -Descending)) {
        if ($backupDirectory.Name -eq '.file-cache') { continue }
        if ($excluded -ne '' -and $backupDirectory.FullName.TrimEnd('\') -eq $excluded) { continue }

        $candidate = Join-Path $backupDirectory.FullName $RelativePath.Replace('/', '\')
        if ((Test-Path -LiteralPath $candidate -PathType Leaf) -and (Get-FileSha256 $candidate) -eq $ExpectedHash) {
            return $candidate
        }
    }
    return $null
}

function Copy-FtpDirectory([string]$RemoteDirectory, [string]$LocalDirectory) {
    New-Item -ItemType Directory -Path $LocalDirectory -Force | Out-Null
    $listing = Invoke-Curl @((Get-FtpUrl $RemoteDirectory $true))

    foreach ($line in $listing) {
        if ($line -notmatch '^([d-])[rwx-]{9}\s+\d+\s+\S+\s+\S+\s+(\d+)\s+\S+\s+\d+\s+[\d:]+\s+(.+)$') { continue }
        $kind = $Matches[1]
        $expectedSize = [int64]$Matches[2]
        $name = $Matches[3]
        if ($name -in '.', '..') { continue }

        $remoteChild = "$($RemoteDirectory.TrimEnd('/'))/$name"
        $localChild = Join-Path $LocalDirectory $name
        if ($kind -eq 'd') {
            Copy-FtpDirectory $remoteChild $localChild
        } else {
            if ((Test-Path -LiteralPath $localChild) -and
                (Get-Item -LiteralPath $localChild).Length -eq $expectedSize) {
                continue
            }
            Invoke-Curl @('--output', $localChild, (Get-FtpUrl $remoteChild $false))
            Write-Output $localChild
        }
    }
}

if (-not [string]::IsNullOrWhiteSpace($PathsFromDirectory) -or @($RelativePaths).Count -gt 0) {
    $selectedPaths = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)

    if (-not [string]::IsNullOrWhiteSpace($PathsFromDirectory)) {
        $selectionRoot = (Resolve-Path -LiteralPath $PathsFromDirectory).Path
        foreach ($selectedFile in (Get-ChildItem -LiteralPath $selectionRoot -File -Recurse)) {
            $relative = $selectedFile.FullName.Substring($selectionRoot.Length).TrimStart('\').Replace('\', '/')
            [void]$selectedPaths.Add($relative)
        }
    }

    foreach ($requestedPath in @($RelativePaths)) {
        $relative = ([string]$requestedPath).Replace('\', '/').Trim('/')
        if ([string]::IsNullOrWhiteSpace($relative)) { continue }
        if (($relative -split '/') -contains '..') { throw "Refusing an unsafe backup path: $requestedPath" }
        [void]$selectedPaths.Add($relative)
    }

    if ($selectedPaths.Count -eq 0) { throw 'No release files were selected for backup.' }

    New-Item -ItemType Directory -Path $Destination -Force | Out-Null
    $destinationRoot = (Resolve-Path -LiteralPath $Destination).Path

    if ([string]::IsNullOrWhiteSpace($CacheDirectory)) {
        $cacheParent = if (-not [string]::IsNullOrWhiteSpace($ReuseFromDirectory)) {
            $ReuseFromDirectory
        } else {
            Split-Path -Parent $destinationRoot
        }
        $CacheDirectory = Join-Path $cacheParent '.file-cache'
    }
    New-Item -ItemType Directory -Path $CacheDirectory -Force | Out-Null
    $cacheRoot = (Resolve-Path -LiteralPath $CacheDirectory).Path

    $remoteManifest = Get-RemoteManifest
    $remoteHashes = @{}
    if ($null -ne $remoteManifest) {
        foreach ($entry in $remoteManifest.files) {
            $remoteHashes[[string]$entry.path] = ([string]$entry.sha256).ToLowerInvariant()
        }
    }

    $records = [System.Collections.Generic.List[object]]::new()
    $downloadedCount = 0
    $reusedCount = 0
    $skippedCount = 0
    $missingCount = 0

    foreach ($relative in ($selectedPaths | Sort-Object)) {
        $expectedHash = if ($remoteHashes.ContainsKey($relative)) { [string]$remoteHashes[$relative] } else { '' }
        $localFile = Join-Path $destinationRoot $relative.Replace('/', '\')

        if ((Test-Path -LiteralPath $localFile -PathType Leaf) -and
            -not [string]::IsNullOrWhiteSpace($expectedHash) -and
            (Get-FileSha256 $localFile) -eq $expectedHash) {
            $item = Get-Item -LiteralPath $localFile
            $records.Add([pscustomobject]@{ path = $relative; sha256 = $expectedHash; bytes = $item.Length; source = 'already-present' })
            $skippedCount += 1
            Write-Host "  SKIP     $relative"
            continue
        }

        $sourceFile = $null
        $sourceLabel = ''
        if (-not [string]::IsNullOrWhiteSpace($expectedHash)) {
            $cacheFile = Join-Path (Join-Path $cacheRoot $expectedHash.Substring(0, 2)) $expectedHash
            if ((Test-Path -LiteralPath $cacheFile -PathType Leaf) -and (Get-FileSha256 $cacheFile) -eq $expectedHash) {
                $sourceFile = $cacheFile
                $sourceLabel = 'shared-cache'
            } else {
                $reusableFile = Find-ReusableFile $relative $expectedHash $ReuseFromDirectory $destinationRoot
                if ($null -ne $reusableFile) {
                    $cacheParent = Split-Path -Parent $cacheFile
                    New-Item -ItemType Directory -Path $cacheParent -Force | Out-Null
                    [void](Add-BackupLink $reusableFile $cacheFile)
                    $sourceFile = $cacheFile
                    $sourceLabel = 'existing-backup'
                }
            }
        }

        if ($null -eq $sourceFile) {
            $temporaryFile = [IO.Path]::GetTempFileName()
            try {
                $remoteFile = "$($RemotePath.TrimEnd('/'))/$relative"
                & curl.exe --silent --show-error --fail --user "${Username}:$Password" --output $temporaryFile (Get-FtpUrl $remoteFile $false)
                if ($LASTEXITCODE -ne 0) {
                    $missingCount += 1
                    Write-Warning "Remote file was not backed up (it may not exist yet): $relative"
                    continue
                }

                $actualHash = Get-FileSha256 $temporaryFile
                if (-not [string]::IsNullOrWhiteSpace($expectedHash) -and $actualHash -ne $expectedHash) {
                    throw "The live file changed after its deployment manifest was read: $relative"
                }

                $expectedHash = $actualHash
                $cacheFile = Join-Path (Join-Path $cacheRoot $actualHash.Substring(0, 2)) $actualHash
                $cacheParent = Split-Path -Parent $cacheFile
                New-Item -ItemType Directory -Path $cacheParent -Force | Out-Null
                if (-not (Test-Path -LiteralPath $cacheFile -PathType Leaf)) {
                    Move-Item -LiteralPath $temporaryFile -Destination $cacheFile
                }
                $sourceFile = $cacheFile
                $sourceLabel = 'downloaded'
                $downloadedCount += 1
            }
            finally {
                if (Test-Path -LiteralPath $temporaryFile) { Remove-Item -LiteralPath $temporaryFile -Force }
            }
        } else {
            $reusedCount += 1
        }

        $linkMethod = Add-BackupLink $sourceFile $localFile
        $item = Get-Item -LiteralPath $localFile
        $records.Add([pscustomobject]@{ path = $relative; sha256 = $expectedHash; bytes = $item.Length; source = $sourceLabel; storage = $linkMethod })
        $statusLine = if ($sourceLabel -eq 'downloaded') { "  DOWNLOAD $relative" } else { "  REUSE    $relative" }
        Write-Host $statusLine
    }

    $backupManifest = [ordered]@{
        version = 1
        capturedAtUtc = [DateTime]::UtcNow.ToString('o')
        remote = "ftp://$FtpHost/$($RemotePath.TrimEnd('/'))/"
        selected = $selectedPaths.Count
        downloaded = $downloadedCount
        reused = $reusedCount
        skipped = $skippedCount
        missing = $missingCount
        files = @($records)
    }
    $backupManifest | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $destinationRoot 'backup-manifest.json') -Encoding utf8

    Write-Host "Incremental release backup complete: $downloadedCount downloaded, $reusedCount reused, $skippedCount already present, $missingCount absent remotely."
    return
}

if (-not $Full) {
    throw 'No backup paths were selected. A full-site backup must be requested explicitly with -Full.'
}

Write-Host 'A full-site FTP snapshot was explicitly requested.'
Copy-FtpDirectory $RemotePath $Destination
