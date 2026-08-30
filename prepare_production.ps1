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
    'draw.css',
    'draw.js',
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
    'assets/ui-materials/black-opal-donation-material-v1-optimized.webp',
    'icons/apple-touch-icon.png',
    'icons/favicon-96x96.png',
    'icons/favicon.ico',
    'icons/site.webmanifest',
    'icons/web-app-manifest-192x192.png',
    'icons/web-app-manifest-512x512.png'
)

foreach ($relativePath in $publicFiles) {
    Copy-PublicFile $relativePath
}

$publicDirectories = @(
    'nuncastra',
    'assets/tarot/1909-rws'
)

foreach ($relativePath in $publicDirectories) {
    Copy-PublicDirectory $relativePath
}

# Browsers still request this at the domain root even when the HTML is quiet.
Copy-Item -LiteralPath (Join-Path $sourceRoot 'icons\favicon.ico') -Destination (Join-Path $destinationRoot 'favicon.ico') -Force

# Give every generated page the same install icons and social-preview metadata.
# Page-specific title, description, and canonical values remain authoritative.
$openGraphImage = 'https://lostopal.com/assets/logo/lost-opal-logo-cabochons-transparent-v1.webp'
Get-ChildItem -LiteralPath $destinationRoot -Filter '*.html' -File -Recurse | ForEach-Object {
    $htmlPath = $_.FullName
    $html = Get-Content -LiteralPath $htmlPath -Raw
    $headAdditions = [System.Collections.Generic.List[string]]::new()

    if ($html -notmatch 'rel=["'']manifest["'']') {
        $headAdditions.Add('  <link rel="icon" href="/icons/favicon.ico" sizes="any">')
        $headAdditions.Add('  <link rel="icon" type="image/png" sizes="96x96" href="/icons/favicon-96x96.png">')
        $headAdditions.Add('  <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">')
        $headAdditions.Add('  <link rel="manifest" href="/icons/site.webmanifest">')
        $headAdditions.Add('  <meta name="apple-mobile-web-app-capable" content="yes">')
        $headAdditions.Add('  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">')
        $headAdditions.Add('  <meta name="apple-mobile-web-app-title" content="Lost Opal">')
    }

    if ($html -notmatch 'serviceWorker\.register') {
        $headAdditions.Add('  <script>if ("serviceWorker" in navigator) { window.addEventListener("load", function () { navigator.serviceWorker.register("/service-worker.js").catch(function () {}); }); }</script>')
    }

    if ($html -notmatch 'property=["'']og:title["'']') {
        $titleMatch = [regex]::Match($html, '<title>(?<value>.*?)</title>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
        $descriptionMatch = [regex]::Match($html, '<meta\s+name=["'']description["'']\s+content=["''](?<value>.*?)["'']\s*/?>', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
        $canonicalMatch = [regex]::Match($html, '<link\s+rel=["'']canonical["'']\s+href=["''](?<value>.*?)["'']\s*/?>', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
        $pageTitle = if ($titleMatch.Success) { [System.Net.WebUtility]::HtmlDecode(($titleMatch.Groups['value'].Value -replace '<[^>]+>', '')) } else { 'Lost Opal Tarot & Astrology' }
        $pageDescription = if ($descriptionMatch.Success) { [System.Net.WebUtility]::HtmlDecode($descriptionMatch.Groups['value'].Value) } else { 'Tarot readings, spiritual education, and private browser-based tools from Lost Opal.' }
        $pageUrl = if ($canonicalMatch.Success) { $canonicalMatch.Groups['value'].Value } else { 'https://lostopal.com/' }
        $encodedTitle = [System.Net.WebUtility]::HtmlEncode($pageTitle)
        $encodedDescription = [System.Net.WebUtility]::HtmlEncode($pageDescription)

        $headAdditions.Add("  <meta property=`"og:title`" content=`"$encodedTitle`">")
        $headAdditions.Add("  <meta property=`"og:description`" content=`"$encodedDescription`">")
        $headAdditions.Add('  <meta property="og:type" content="website">')
        $headAdditions.Add("  <meta property=`"og:url`" content=`"$pageUrl`">")
        $headAdditions.Add("  <meta property=`"og:image`" content=`"$openGraphImage`">")
        $headAdditions.Add('  <meta name="twitter:card" content="summary">')
        $headAdditions.Add("  <meta name=`"twitter:title`" content=`"$encodedTitle`">")
        $headAdditions.Add("  <meta name=`"twitter:description`" content=`"$encodedDescription`">")
        $headAdditions.Add("  <meta name=`"twitter:image`" content=`"$openGraphImage`">")
    }

    if ($html -notmatch 'application/ld\+json') {
        $schema = $null
        if ($htmlPath -eq (Join-Path $destinationRoot 'index.html')) {
            $schema = [ordered]@{
                '@context' = 'https://schema.org'
                '@graph' = @(
                    [ordered]@{
                        '@type' = 'Organization'
                        '@id' = 'https://lostopal.com/#organization'
                        name = 'Lost Opal Tarot & Astrology'
                        url = 'https://lostopal.com/'
                        logo = $openGraphImage
                        email = 'mailto:opal@lostopal.com'
                        areaServed = [ordered]@{ '@type' = 'AdministrativeArea'; name = 'Greater Phoenix, Arizona' }
                        sameAs = @(
                            'https://www.youtube.com/@LostOpalTarot',
                            'https://www.twitch.tv/lostopaltarot',
                            'https://www.tiktok.com/@lostopaltarot',
                            'https://www.instagram.com/lostopaltarot/'
                        )
                    },
                    [ordered]@{
                        '@type' = 'Person'
                        '@id' = 'https://lostopal.com/#bryan-c-tucker'
                        name = 'Bryan C. Tucker'
                        url = 'https://lostopal.com/#about'
                        worksFor = [ordered]@{ '@id' = 'https://lostopal.com/#organization' }
                    }
                )
            }
        } elseif ($htmlPath -eq (Join-Path $destinationRoot 'nuncastra\index.html')) {
            $schema = [ordered]@{
                '@context' = 'https://schema.org'
                '@type' = 'WebApplication'
                name = 'Nuncastra'
                url = 'https://lostopal.com/nuncastra/'
                description = 'A private browser-based tool that translates a chosen moment of sky into a Tarot story through Lost Opal correspondences.'
                applicationCategory = 'LifestyleApplication'
                operatingSystem = 'Any'
                browserRequirements = 'Requires JavaScript and a modern web browser.'
                isAccessibleForFree = $true
                provider = [ordered]@{ '@id' = 'https://lostopal.com/#organization' }
            }
        }

        if ($null -ne $schema) {
            $schemaJson = ConvertTo-Json -InputObject $schema -Depth 8 -Compress
            $headAdditions.Add("  <script type=`"application/ld+json`">$schemaJson</script>")
        }
    }

    if ($headAdditions.Count -gt 0) {
        $injection = ($headAdditions -join [Environment]::NewLine) + [Environment]::NewLine
        $html = $html -replace '</head>', "$injection</head>"
        Set-Content -LiteralPath $htmlPath -Value $html -Encoding utf8
    }
}

# Generate a content-versioned offline shell after the public package is assembled.
# The cache includes the whole small static site, Nuncastra's ephemeris runtime,
# and the Tarot artwork; cross-origin requests such as Photon remain network-only.
$precacheFiles = Get-ChildItem -LiteralPath $destinationRoot -File -Recurse |
    Where-Object { -not $_.Name.StartsWith('.') -and $_.Name -ne 'service-worker.js' } |
    Sort-Object FullName

$precacheUrls = foreach ($file in $precacheFiles) {
    $relativePath = $file.FullName.Substring($destinationRoot.Length).TrimStart('\').Replace('\', '/')
    if ($relativePath -eq 'index.html') {
        '/'
    } elseif ($relativePath.EndsWith('/index.html', [System.StringComparison]::OrdinalIgnoreCase)) {
        '/' + $relativePath.Substring(0, $relativePath.Length - 'index.html'.Length)
    } else {
        '/' + $relativePath
    }
}

$cacheSeed = ($precacheFiles | ForEach-Object {
    $relativePath = $_.FullName.Substring($destinationRoot.Length).TrimStart('\').Replace('\', '/')
    "$relativePath|$((Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash)"
}) -join "`n"
$sha256 = [System.Security.Cryptography.SHA256]::Create()
try {
    $cacheHash = [System.BitConverter]::ToString($sha256.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($cacheSeed))).Replace('-', '').ToLowerInvariant().Substring(0, 16)
} finally {
    $sha256.Dispose()
}

$precacheJson = ConvertTo-Json -InputObject @($precacheUrls) -Compress
$serviceWorkerTemplate = @'
const CACHE_NAME = "lost-opal-__CACHE_HASH__";
const PRECACHE_URLS = __PRECACHE_URLS__;

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.filter((name) => name.startsWith("lost-opal-") && name !== CACHE_NAME).map((name) => caches.delete(name))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, response.clone());
        }
        return response;
      } catch {
        return (await caches.match(request, { ignoreSearch: true }))
          || (await caches.match(url.pathname, { ignoreSearch: true }))
          || (await caches.match("/not_found.html"));
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request, { ignoreSearch: true });
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  })());
});
'@

$serviceWorker = $serviceWorkerTemplate.Replace('__CACHE_HASH__', $cacheHash).Replace('__PRECACHE_URLS__', $precacheJson)
Set-Content -LiteralPath (Join-Path $destinationRoot 'service-worker.js') -Value $serviceWorker -Encoding utf8

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
