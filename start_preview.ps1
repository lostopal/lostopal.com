param(
    [int]$Port = 8080
)

$ErrorActionPreference = 'Stop'
$siteRoot = Join-Path $PSScriptRoot 'phase-1-luminous-prototype'

if (-not (Test-Path -LiteralPath (Join-Path $siteRoot 'index.html'))) {
    throw "phase-1-luminous-prototype/index.html was not found."
}

Write-Host "Previewing $siteRoot"
Write-Host "Open http://localhost:$Port/ in your browser. Press Ctrl+C to stop."
& py -m http.server $Port --bind 127.0.0.1 --directory $siteRoot
