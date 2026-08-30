param(
    [string]$FtpHost = 'ftpupload.net',
    [string]$RemotePath = 'lostopal.com/htdocs',
    [string]$SourceDirectory = 'production-site',
    [string]$CredentialTarget = 'LostOpalTarot-FTP',
    [string]$Username = $env:LOST_OPAL_FTP_USER,
    [string]$Password = $env:LOST_OPAL_FTP_PASS,
    [switch]$Publish,
    [switch]$Mirror,
    [switch]$ForceUpload
)

$ErrorActionPreference = 'Stop'
$workspaceRoot = (Resolve-Path -LiteralPath $PSScriptRoot).Path
$siteRoot = (Resolve-Path -LiteralPath (Join-Path $workspaceRoot $SourceDirectory)).Path
$remoteRoot = $RemotePath.Trim('/')

if ($remoteRoot -ne 'lostopal.com/htdocs') {
    throw "Refusing to publish or prune an unexpected remote root: $remoteRoot"
}

if (-not $siteRoot.StartsWith($workspaceRoot, [System.StringComparison]::OrdinalIgnoreCase) -or
    (Split-Path -Leaf $siteRoot) -ne 'production-site') {
    throw "Refusing to publish an unexpected local directory: $siteRoot"
}

if (-not (Test-Path -LiteralPath (Join-Path $siteRoot 'index.html') -PathType Leaf)) {
    throw 'production-site/index.html was not found. Run prepare_production.ps1 first.'
}

$manifestPath = Join-Path $siteRoot '.deployment-manifest.json'
if (-not (Test-Path -LiteralPath $manifestPath -PathType Leaf)) {
    throw 'The deployment manifest is missing. Run prepare_production.ps1 first.'
}

function Encode-RemotePath([string]$Path) {
    return (($Path -split '/') | Where-Object { $_ -ne '' } | ForEach-Object {
        [Uri]::EscapeDataString($_)
    }) -join '/'
}

function Get-FtpUrl([string]$Path, [bool]$IsDirectory = $false) {
    $url = "ftp://$FtpHost/$(Encode-RemotePath $Path)"
    if ($IsDirectory -and -not $url.EndsWith('/')) { $url += '/' }
    return $url
}

function Get-WindowsGenericCredential([string]$Target) {
    if (-not ('LostOpal.CredentialReader' -as [type])) {
        Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;

namespace LostOpal {
    public static class CredentialReader {
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

    $stored = [LostOpal.CredentialReader]::Read($Target)
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

function Invoke-Curl([string[]]$Arguments) {
    $output = & curl.exe --silent --show-error --fail --user "${Username}:$Password" @Arguments
    if ($LASTEXITCODE -ne 0) { throw "curl failed with exit code $LASTEXITCODE" }
    return $output
}

function Get-RemoteManifest {
    $temporaryFile = [IO.Path]::GetTempFileName()
    try {
        & curl.exe --silent --fail --user "${Username}:$Password" --output $temporaryFile (Get-FtpUrl "$remoteRoot/.deployment-manifest.json")
        if ($LASTEXITCODE -ne 0) { return $null }
        return Get-Content -LiteralPath $temporaryFile -Raw | ConvertFrom-Json
    }
    finally {
        if (Test-Path -LiteralPath $temporaryFile) { Remove-Item -LiteralPath $temporaryFile -Force }
    }
}

$remoteFiles = [System.Collections.Generic.List[string]]::new()
$remoteDirectories = [System.Collections.Generic.List[string]]::new()

function Add-RemoteTree([string]$RemoteDirectory, [string]$RelativePrefix = '') {
    $listing = Invoke-Curl @((Get-FtpUrl $RemoteDirectory $true))
    foreach ($line in $listing) {
        if ($line -notmatch '^([d-])[rwx-]{9}\s+\d+\s+\S+\s+\S+\s+(\d+)\s+\S+\s+\d+\s+[\d:]+\s+(.+)$') { continue }
        $kind = $Matches[1]
        $name = $Matches[3]
        if ($name -in '.', '..') { continue }
        $relative = if ([string]::IsNullOrWhiteSpace($RelativePrefix)) { $name } else { "$RelativePrefix/$name" }
        $remoteChild = "$($RemoteDirectory.TrimEnd('/'))/$name"
        if ($kind -eq 'd') {
            $remoteDirectories.Add($relative)
            Add-RemoteTree $remoteChild $relative
        } else {
            $remoteFiles.Add($relative)
        }
    }
}

function Send-File([string]$RelativePath) {
    $localFile = Join-Path $siteRoot $RelativePath.Replace('/', '\')
    $remoteFile = "$remoteRoot/$RelativePath"
    Invoke-Curl @('--ftp-create-dirs', '--upload-file', $localFile, (Get-FtpUrl $remoteFile)) | Out-Null
}

function Invoke-FtpQuote([string]$Command) {
    Invoke-Curl @('--quote', $Command, "ftp://$FtpHost/") | Out-Null
}

$localManifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
$remoteManifest = Get-RemoteManifest
$remoteHashes = @{}
if ($null -ne $remoteManifest) {
    foreach ($entry in $remoteManifest.files) {
        $remoteHashes[[string]$entry.path] = [string]$entry.sha256
    }
}

$uploads = [System.Collections.Generic.List[string]]::new()
foreach ($entry in $localManifest.files) {
    $path = [string]$entry.path
    if ($ForceUpload -or -not $remoteHashes.ContainsKey($path) -or $remoteHashes[$path] -ne [string]$entry.sha256) {
        $uploads.Add($path)
    }
}

$remoteOnlyFiles = [System.Collections.Generic.List[string]]::new()
$remoteOnlyDirectories = [System.Collections.Generic.List[string]]::new()
if ($Mirror) {
    Add-RemoteTree $remoteRoot
    $localPaths = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
    foreach ($entry in $localManifest.files) { [void]$localPaths.Add([string]$entry.path) }
    [void]$localPaths.Add('.deployment-manifest.json')

    foreach ($path in $remoteFiles) {
        if (-not $localPaths.Contains($path)) { $remoteOnlyFiles.Add($path) }
    }

    $localDirectories = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
    foreach ($path in $localPaths) {
        $parts = $path -split '/'
        for ($index = 1; $index -lt $parts.Count; $index += 1) {
            [void]$localDirectories.Add(($parts[0..($index - 1)] -join '/'))
        }
    }
    foreach ($directory in $remoteDirectories) {
        if (-not $localDirectories.Contains($directory)) { $remoteOnlyDirectories.Add($directory) }
    }
}

Write-Host "Source: $siteRoot"
Write-Host "Destination: ftp://$FtpHost/$remoteRoot/"
Write-Host "Changed/new files: $($uploads.Count)"
Write-Host "Remote-only files to remove: $($remoteOnlyFiles.Count)"
Write-Host "Remote-only directories to remove: $($remoteOnlyDirectories.Count)"
foreach ($path in $uploads) { Write-Host "  UPLOAD $path" }
foreach ($path in $remoteOnlyFiles) { Write-Host "  DELETE $path" }
foreach ($path in ($remoteOnlyDirectories | Sort-Object { ($_ -split '/').Count } -Descending)) { Write-Host "  RMDIR  $path" }

if (-not $Publish) {
    Write-Host 'Dry run only. Nothing was changed.'
    Write-Host 'Use -Publish to upload changes; add -Mirror to remove remote files that are not in production-site.'
    exit 0
}

foreach ($path in $uploads) {
    Send-File $path
    Write-Host "Uploaded $path"
}

if ($Mirror) {
    foreach ($path in $remoteOnlyFiles) {
        Invoke-FtpQuote "DELE /$remoteRoot/$path"
        Write-Host "Deleted $path"
    }
    foreach ($path in ($remoteOnlyDirectories | Sort-Object { ($_ -split '/').Count } -Descending)) {
        Invoke-FtpQuote "RMD /$remoteRoot/$path"
        Write-Host "Removed directory $path"
    }
}

# Publish the manifest last. If a transfer fails, the old manifest keeps the
# next run from mistaking a partial release for a complete one.
Send-File '.deployment-manifest.json'
Write-Host 'Uploaded .deployment-manifest.json'
if ($Mirror) {
    Write-Host 'Mirrored publish complete.'
} else {
    Write-Host 'Incremental publish complete. Remote-only files were preserved.'
}
