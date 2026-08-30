param(
    [string]$SourceDirectory = 'phase-1-luminous-prototype',
    [string]$DestinationDirectory = 'production-site'
)

$ErrorActionPreference = 'Stop'
$workspaceRoot = (Resolve-Path -LiteralPath $PSScriptRoot).Path
$sourceRoot = (Resolve-Path -LiteralPath (Join-Path $workspaceRoot $SourceDirectory)).Path
$destinationRoot = Join-Path $workspaceRoot $DestinationDirectory

if ((Split-Path -Parent $destinationRoot) -ne $workspaceRoot -or
    (Split-Path -Leaf $destinationRoot) -ne 'production-site') {
    throw "Refusing to prepare an unexpected destination: $destinationRoot"
}

if (Test-Path -LiteralPath $destinationRoot) {
    $resolvedDestination = (Resolve-Path -LiteralPath $destinationRoot).Path
    if ($resolvedDestination -ne $destinationRoot) {
        throw "Refusing to clear an unexpected destination: $resolvedDestination"
    }
    Remove-Item -LiteralPath $resolvedDestination -Recurse -Force
}

New-Item -ItemType Directory -Path $destinationRoot | Out-Null

function Copy-PublicFile([string]$RelativePath) {
    $sourceFile = Join-Path $sourceRoot $RelativePath
    if (-not (Test-Path -LiteralPath $sourceFile -PathType Leaf)) {
        throw "Missing production file: $RelativePath"
    }

    $destinationFile = Join-Path $destinationRoot $RelativePath
    $destinationParent = Split-Path -Parent $destinationFile
    if (-not (Test-Path -LiteralPath $destinationParent)) {
        New-Item -ItemType Directory -Path $destinationParent -Force | Out-Null
    }
    Copy-Item -LiteralPath $sourceFile -Destination $destinationFile -Force
}

function Copy-PublicDirectory([string]$RelativePath) {
    $sourceDirectory = Join-Path $sourceRoot $RelativePath
    if (-not (Test-Path -LiteralPath $sourceDirectory -PathType Container)) {
        throw "Missing production directory: $RelativePath"
    }

    $destinationDirectory = Join-Path $destinationRoot $RelativePath
    $resolvedSourceDirectory = (Resolve-Path -LiteralPath $sourceDirectory).Path
    if (-not $resolvedSourceDirectory.StartsWith($sourceRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Refusing to copy a directory outside the approved source: $resolvedSourceDirectory"
    }

    $destinationParent = Split-Path -Parent $destinationDirectory
    if (-not (Test-Path -LiteralPath $destinationParent)) {
        New-Item -ItemType Directory -Path $destinationParent -Force | Out-Null
    }
    Copy-Item -LiteralPath $resolvedSourceDirectory -Destination $destinationDirectory -Recurse -Force
}

$publicFiles = @(
    '.htaccess',
    'index.html',
    'draw.html',
    'not_found.html',
    'llms.txt',
    'llms-full.txt',
    'robots.txt',
    'sitemap.xml',
    'styles.css',
    'luminous.css',
    'black-opal-theme.css',
    'site-audit.css',
    'site-future.css',
    'prototype.js',
    'black-opal-sky.js',
    'planetary-overlays.js',
    'planetary-vortex.js',
    'contact/index.html',
    'contact/contact.css',
    'donate/index.html',
    'donate/donate.css',
    'ethics/index.html',
    'ethics/ethics.css',
    'astrology/index.html',
    'astrology/daily-snapshot/index.html',
    'astrology/nuncastra/index.html',
    'crystals/index.html',
    'learn/reading-styles/index.html',
    'assets/home-black-opal-temple-medallion-v2.webp',
    'assets/backgrounds/black-opal-cosmic-convergence-v1.webp',
    'assets/backgrounds/black-opal-donation-landing-v1.webp',
    'assets/bryan-c-tucker-professional-portrait.webp',
    'assets/fonts/lost-opal-display/LostOpalDisplay-Regular.ttf',
    'assets/fonts/UnifrakturCook-Bold.ttf',
    'assets/lost-opal-mark-optimized.webp',
    'assets/lost-opal-public-reading-primary-upright-v1.webp',
    'assets/logo/lost-opal-logo-cabochons-transparent-v1.webp',
    'assets/logo/lost-opal-ornate-yin-yang-nav.webp',
    'assets/payment-logos/cash-app-symbol.svg',
    'assets/payment-logos/kofi.webp',
    'assets/payment-logos/paypal.svg',
    'assets/payment-logos/powered-by-stripe.svg',
    'assets/payment-logos/venmo-monogram.webp',
    'assets/planetary-cabochons/v2/black-opal/jupiter.webp',
    'assets/planetary-cabochons/v2/black-opal/mars.webp',
    'assets/planetary-cabochons/v2/black-opal/mercury.webp',
    'assets/planetary-cabochons/v2/black-opal/moon.webp',
    'assets/planetary-cabochons/v2/black-opal/saturn.webp',
    'assets/planetary-cabochons/v2/black-opal/sun.webp',
    'assets/planetary-cabochons/v2/black-opal/venus.webp',
    'assets/planetary-cabochons/v3-planet-colors/mercury-orange-opal.webp',
    'assets/planetary-cabochons/v3-planet-colors/sun-yellow-opal.webp',
    'assets/planetary-cabochons/v3-planet-colors/venus-emerald-opal.webp',
    'assets/social/instagram.svg',
    'assets/social/tiktok.svg',
    'assets/social/twitch.svg',
    'assets/social/youtube.svg',
    'assets/ui-materials/black-opal-button-material-v1-optimized.webp',
    'assets/ui-materials/black-opal-donation-material-v1-optimized.webp'
)

foreach ($relativePath in $publicFiles) {
    Copy-PublicFile $relativePath
}

$publicDirectories = @(
    'nuncastra',
    'assets/tarot/1909-rws',
    'icons'
)

foreach ($relativePath in $publicDirectories) {
    Copy-PublicDirectory $relativePath
}

# Browsers still request this at the domain root even when the HTML is quiet.
Copy-Item -LiteralPath (Join-Path $sourceRoot 'icons\favicon.ico') -Destination (Join-Path $destinationRoot 'favicon.ico') -Force

# This content-addressed manifest lets the publisher upload only files whose
# bytes changed while still safely identifying remote files that no longer
# belong to the public site. The manifest intentionally does not hash itself.
$manifestEntries = Get-ChildItem -LiteralPath $destinationRoot -File -Recurse |
    Sort-Object FullName |
    ForEach-Object {
        [ordered]@{
            path = $_.FullName.Substring($destinationRoot.Length).TrimStart('\').Replace('\', '/')
            bytes = $_.Length
            sha256 = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
        }
    }

$deploymentManifest = [ordered]@{
    version = 1
    generatedAtUtc = [DateTime]::UtcNow.ToString('o')
    files = @($manifestEntries)
}

$deploymentManifest |
    ConvertTo-Json -Depth 5 |
    Set-Content -LiteralPath (Join-Path $destinationRoot '.deployment-manifest.json') -Encoding utf8

$outputFiles = Get-ChildItem -LiteralPath $destinationRoot -File -Recurse
$outputBytes = ($outputFiles | Measure-Object -Property Length -Sum).Sum
Write-Output "Production package ready: $($outputFiles.Count) files, $([math]::Round($outputBytes / 1MB, 2)) MB"
Write-Output $destinationRoot
