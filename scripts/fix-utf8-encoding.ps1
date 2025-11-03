# Fix UTF-8 encoding issues by removing emojis

Write-Host "Fixing UTF-8 encoding issues..." -ForegroundColor Cyan

# Function to clean content
function Clean-Content {
    param($content)
    
    # Replace problematic emojis with text
    $replacements = @{
        '👷' = 'CHASER'
        '👮' = 'SUPE'
        '🔧' = '[ADMIN]'
        '👑' = '[SUPER]'
        '✅' = '[OK]'
        '❌' = '[X]'
        '🚨' = '[ALERT]'
        '📍' = '[LOC]'
        '🗺️' = '[MAP]'
        '💬' = '[MSG]'
        '📸' = '[PHOTO]'
        '📝' = '[DOC]'
        '🔍' = '[SEARCH]'
        '⚠️' = '[WARN]'
        '💾' = '[SAVE]'
        '🔄' = '[SYNC]'
        '🚀' = '[LAUNCH]'
        '🎯' = '[TARGET]'
        '📊' = '[STATS]'
        '⚡' = '[FAST]'
        '🔐' = '[SECURE]'
        '📋' = '[LIST]'
        '✏️' = '[EDIT]'
        '🗑️' = '[DELETE]'
        '➕' = '[ADD]'
        '🏠' = '[HOME]'
        '🔔' = '[NOTIF]'
        '⏰' = '[TIME]'
        '📌' = '[PIN]'
        '🎨' = '[STYLE]'
        '💡' = '[IDEA]'
        '🐛' = '[BUG]'
        '🏗️' = '[BUILD]'
        '📦' = '[PKG]'
        '🔗' = '[LINK]'
        '📱' = '[MOBILE]'
        '💻' = '[DESKTOP]'
        '🌐' = '[WEB]'
        '🛠️' = '[TOOLS]'
        '📡' = '[API]'
        '🗄️' = '[DB]'
        '🔥' = '[FIRE]'
        '✨' = '[NEW]'
        '🎁' = '[FEAT]'
        '🐴' = '[FAST]'
        '🦄' = '[UNIQUE]'
        '🚦' = '[STATUS]'
        '🌈' = '[COLOR]'
        '🎭' = '[ROLE]'
        '🛡️' = '[SHIELD]'
        '⭐' = '[STAR]'
        '❤️' = '[HEART]'
        '👍' = '[GOOD]'
        '👎' = '[BAD]'
        '✋' = '[STOP]'
        '👉' = '[POINT]'
        '🔑' = '[KEY]'
        '📈' = '[UP]'
        '📉' = '[DOWN]'
        '🏃' = '[RUN]'
        '🚗' = '[CAR]'
        '🚁' = '[HELI]'
        '🏥' = '[HOSP]'
        '🌡️' = '[TEMP]'
        '🌍' = '[WORLD]'
        '📆' = '[DATE]'
        '⏱️' = '[TIMER]'
        '💰' = '[MONEY]'
        '💳' = '[CARD]'
        '📞' = '[PHONE]'
        '📧' = '[EMAIL]'
        '📮' = '[MAIL]'
        '🔐' = '[LOCK]'
        '🔓' = '[UNLOCK]'
        '🔒' = '[LOCKED]'
        '🔏' = '[SECURED]'
        '☁️' = '[CLOUD]'
        '⚙️' = '[CONFIG]'
        '🧩' = '[PUZZLE]'
        '🎲' = '[RANDOM]'
        '🎯' = '[TARGET]'
        '📎' = '[ATTACH]'
        '📁' = '[FOLDER]'
        '📂' = '[OPEN]'
        '🗂️' = '[FILES]'
        '📄' = '[PAGE]'
        '📃' = '[DOC]'
        '📑' = '[TABS]'
        '📊' = '[CHART]'
        '📈' = '[GROWTH]'
        '📉' = '[DECLINE]'
        '🗒️' = '[NOTE]'
        '🗓️' = '[CALENDAR]'
        '📅' = '[SCHEDULE]'
        '⏰' = '[ALARM]'
        '⏳' = '[WAIT]'
        '⌛' = '[TIME]'
        '📍' = '[PIN]'
        '🌏' = '[GLOBE]'
        '🗺️' = '[MAP]'
        '🧭' = '[COMPASS]'
        '🏔️' = '[MOUNTAIN]'
        '🏖️' = '[BEACH]'
        '🏜️' = '[DESERT]'
        '🏝️' = '[ISLAND]'
        '🏞️' = '[PARK]'
        '🏟️' = '[STADIUM]'
        '🏛️' = '[BUILDING]'
        '🏗️' = '[CONSTRUCT]'
        '🏚️' = '[ABANDON]'
        '🏘️' = '[HOUSES]'
        '🏙️' = '[CITY]'
        '🌆' = '[SUNSET]'
        '🌇' = '[SUNRISE]'
        '🌉' = '[BRIDGE]'
        '🌃' = '[NIGHT]'
        '🌌' = '[STARS]'
        '🌁' = '[FOG]'
        '🌄' = '[MOUNTAIN]'
        '🌅' = '[SUNRISE]'
        '🌠' = '[STAR]'
        '🎆' = '[FIREWORK]'
        '🎇' = '[SPARKLE]'
        '🌈' = '[RAINBOW]'
        '❄️' = '[SNOW]'
        '☀️' = '[SUN]'
        '🌤️' = '[PARTLY]'
        '⛅' = '[CLOUD]'
        '🌥️' = '[CLOUDY]'
        '🌦️' = '[RAIN]'
        '🌧️' = '[RAINY]'
        '⛈️' = '[STORM]'
        '🌩️' = '[THUNDER]'
        '🌨️' = '[SNOW]'
        '☔' = '[UMBRELLA]'
        '⚡' = '[BOLT]'
        '🔥' = '[FIRE]'
        '💧' = '[DROP]'
        '🌊' = '[WAVE]'
    }
    
    foreach ($emoji in $replacements.Keys) {
        $content = $content -replace [regex]::Escape($emoji), $replacements[$emoji]
    }
    
    return $content
}

# Fix specific problematic files
$problematicFiles = @(
    "src/app/admin/page.tsx",
    "src/components/features/god-mode-card.tsx",
    "src/components/features/supe-controls-card.tsx"
)

foreach ($filePath in $problematicFiles) {
    if (Test-Path $filePath) {
        try {
            $content = [System.IO.File]::ReadAllText($filePath)
            $cleanContent = Clean-Content -content $content
            [System.IO.File]::WriteAllText($filePath, $cleanContent, [System.Text.UTF8Encoding]::new($false))
            Write-Host "Cleaned and re-encoded: $filePath" -ForegroundColor Green
        } catch {
            Write-Host "Error processing: $filePath - $_" -ForegroundColor Red
        }
    }
}

# Also check all other files for emojis
Write-Host "`nScanning all files for emojis..." -ForegroundColor Yellow

$allFiles = Get-ChildItem -Path "src" -Recurse -Include "*.ts","*.tsx","*.js","*.jsx"
$filesWithEmojis = 0

foreach ($file in $allFiles) {
    try {
        $content = [System.IO.File]::ReadAllText($file.FullName)
        $originalLength = $content.Length
        $cleanContent = Clean-Content -content $content
        
        if ($originalLength -ne $cleanContent.Length) {
            [System.IO.File]::WriteAllText($file.FullName, $cleanContent, [System.Text.UTF8Encoding]::new($false))
            Write-Host "Cleaned emojis from: $($file.Name)" -ForegroundColor Yellow
            $filesWithEmojis++
        }
    } catch {
        # Skip files that can't be read
    }
}

Write-Host "`nUTF-8 encoding fixes completed!" -ForegroundColor Green
Write-Host "Files cleaned: $filesWithEmojis" -ForegroundColor Cyan
