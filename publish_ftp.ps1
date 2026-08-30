param(
    [string]$FtpHost = 'ftpupload.net',
    [string]$RemotePath = 'lostopal.com/htdocs',
    [string]$SourceDirectory = 'working-site',
    [string]$CredentialTarget = 'LostOpalTarot-FTP',
    [string]$Username = $env:LOST_OPAL_FTP_USER,
    [string]$Password = $env:LOST_OPAL_FTP_PASS,
    [switch]$Publish
)

$ErrorActionPreference = 'Stop'
$siteRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot $SourceDirectory)).Path

if (-not (Test-Path -LiteralPath (Join-Path $siteRoot 'index.html'))) {
    throw "working-site/index.html was not found."
}

function Encode-RemotePath([string]$Path) {
    return (($Path -split '/') | Where-Object { $_ -ne '' } | ForEach-Object {
        [Uri]::EscapeDataString($_)
    }) -join '/'
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

$files = Get-ChildItem -LiteralPath $siteRoot -File -Recurse
Write-Host "Source: $siteRoot"
Write-Host "Destination: ftp://$FtpHost/$RemotePath/"
Write-Host "Files: $($files.Count)"

if (-not $Publish) {
    Write-Host 'Dry run only. Nothing was uploaded.'
    Write-Host 'Use -Publish and supply credentials when the working copy is approved.'
    exit 0
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

foreach ($file in $files) {
    $relative = $file.FullName.Substring($siteRoot.Length).TrimStart('\').Replace('\', '/')
    $remoteFile = "$($RemotePath.TrimEnd('/'))/$relative"
    $url = "ftp://$FtpHost/$(Encode-RemotePath $remoteFile)"
    & curl.exe --silent --show-error --fail --ftp-create-dirs --user "${Username}:$Password" --upload-file $file.FullName $url
    if ($LASTEXITCODE -ne 0) { throw "Upload failed: $relative" }
    Write-Host "Uploaded $relative"
}

Write-Host 'Publish complete. Remote-only files were not deleted.'
