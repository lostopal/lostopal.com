param(
    [string]$FtpHost = 'ftpupload.net',
    [string]$RemotePath = 'lostopal.com/htdocs',
    [Parameter(Mandatory = $true)][string]$Destination,
    [string]$PathsFromDirectory = '',
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

if (-not [string]::IsNullOrWhiteSpace($PathsFromDirectory)) {
    $selectionRoot = (Resolve-Path -LiteralPath $PathsFromDirectory).Path
    $selectedFiles = Get-ChildItem -LiteralPath $selectionRoot -File -Recurse
    $savedCount = 0

    foreach ($selectedFile in $selectedFiles) {
        $relative = $selectedFile.FullName.Substring($selectionRoot.Length).TrimStart('\').Replace('\', '/')
        $remoteFile = "$($RemotePath.TrimEnd('/'))/$relative"
        $localFile = Join-Path $Destination $relative
        $localParent = Split-Path -Parent $localFile
        New-Item -ItemType Directory -Path $localParent -Force | Out-Null

        & curl.exe --silent --show-error --fail --user "${Username}:$Password" --output $localFile (Get-FtpUrl $remoteFile $false)
        if ($LASTEXITCODE -eq 0) {
            $savedCount += 1
            Write-Output $localFile
        } else {
            if (Test-Path -LiteralPath $localFile) { Remove-Item -LiteralPath $localFile -Force }
            Write-Warning "Remote file was not backed up (it may not exist yet): $relative"
        }
    }

    if ($savedCount -eq 0) {
        throw 'No release files were downloaded from the FTP host.'
    }

    Write-Output "Release backup complete: $savedCount of $($selectedFiles.Count) files."
    return
}

Copy-FtpDirectory $RemotePath $Destination
