param()

$ErrorActionPreference = 'Stop'
$workspaceRoot = (Resolve-Path -LiteralPath $PSScriptRoot).Path
$outputRoot = Join-Path $workspaceRoot 'phase-1-luminous-prototype\nuncastra\data\places'
$tempBase = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
$workRoot = Join-Path $tempBase ("lost-opal-place-index-" + [Guid]::NewGuid().ToString('N'))

if (-not ([IO.Path]::GetFullPath($workRoot)).StartsWith($tempBase, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to use an unexpected temporary directory: $workRoot"
}

New-Item -ItemType Directory -Path $workRoot | Out-Null
try {
    $citiesZip = Join-Path $workRoot 'cities5000.zip'
    $postalZip = Join-Path $workRoot 'US-postal.zip'
    $censusZip = Join-Path $workRoot 'census-places.zip'
    $citiesRoot = Join-Path $workRoot 'cities'
    $postalRoot = Join-Path $workRoot 'postal'
    $censusRoot = Join-Path $workRoot 'census'
    $countries = Join-Path $workRoot 'countryInfo.txt'
    $adminAreas = Join-Path $workRoot 'admin1CodesASCII.txt'

    Invoke-WebRequest -UseBasicParsing 'https://download.geonames.org/export/dump/cities5000.zip' -OutFile $citiesZip
    Invoke-WebRequest -UseBasicParsing 'https://download.geonames.org/export/zip/US.zip' -OutFile $postalZip
    Invoke-WebRequest -UseBasicParsing 'https://download.geonames.org/export/dump/countryInfo.txt' -OutFile $countries
    Invoke-WebRequest -UseBasicParsing 'https://download.geonames.org/export/dump/admin1CodesASCII.txt' -OutFile $adminAreas
    Invoke-WebRequest -UseBasicParsing 'https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2025_Gazetteer/2025_Gaz_place_national.zip' -OutFile $censusZip

    Expand-Archive -LiteralPath $citiesZip -DestinationPath $citiesRoot
    Expand-Archive -LiteralPath $postalZip -DestinationPath $postalRoot
    Expand-Archive -LiteralPath $censusZip -DestinationPath $censusRoot

    & node (Join-Path $workspaceRoot 'build_nuncastra_place_index.mjs') `
        --cities (Join-Path $citiesRoot 'cities5000.txt') `
        --postal (Join-Path $postalRoot 'US.txt') `
        --census (Join-Path $censusRoot '2025_Gaz_place_national.txt') `
        --countries $countries `
        --admin1 $adminAreas `
        --output $outputRoot
    if ($LASTEXITCODE -ne 0) { throw "The place-index builder failed with exit code $LASTEXITCODE." }
} finally {
    $resolvedWorkRoot = if (Test-Path -LiteralPath $workRoot) { (Resolve-Path -LiteralPath $workRoot).Path } else { $null }
    if ($resolvedWorkRoot -and $resolvedWorkRoot.StartsWith($tempBase, [StringComparison]::OrdinalIgnoreCase)) {
        Remove-Item -LiteralPath $resolvedWorkRoot -Recurse -Force
    }
}
