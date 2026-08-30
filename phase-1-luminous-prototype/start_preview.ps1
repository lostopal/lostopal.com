param(
    [int]$Port = 8082
)

$ErrorActionPreference = 'Stop'
$prototypeRoot = $PSScriptRoot

if (-not (Test-Path -LiteralPath (Join-Path $prototypeRoot 'index.html'))) {
    throw "phase-1-luminous-prototype/index.html was not found."
}

Write-Host "Previewing the separate Lost Opal luminous Phase 1 prototype"
Write-Host "Open http://localhost:$Port/ in your browser. Press Ctrl+C to stop."
& py -m http.server $Port --bind 127.0.0.1 --directory $prototypeRoot
