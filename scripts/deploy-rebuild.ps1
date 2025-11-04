# PowerShell Script to Deploy rebuild.4axe.com
# This script helps set up and deploy the Clean Architecture to Vercel

Write-Host "`n🚀 DEPLOYING EMU CLEAN ARCHITECTURE TO rebuild.4axe.com" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

# Check if Vercel CLI is installed
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelInstalled) {
    Write-Host "`n❌ Vercel CLI not installed!" -ForegroundColor Red
    Write-Host "Installing Vercel CLI globally..." -ForegroundColor Yellow
    pnpm add -g vercel
}

# Step 1: Check current branch
Write-Host "`n📌 Checking current branch..." -ForegroundColor Yellow
$currentBranch = git rev-parse --abbrev-ref HEAD
Write-Host "   Current branch: $currentBranch" -ForegroundColor Green

if ($currentBranch -ne "rebuild-proper-architecture") {
    Write-Host "   ⚠️  Warning: Not on rebuild-proper-architecture branch!" -ForegroundColor Yellow
    Write-Host "   Switching branch..." -ForegroundColor Cyan
    git checkout rebuild-proper-architecture
}

# Step 2: Environment Variables Check
Write-Host "`n🔐 Checking environment variables..." -ForegroundColor Yellow
$requiredEnvVars = @(
    "FIREBASE_ADMIN_PROJECT_ID",
    "FIREBASE_ADMIN_CLIENT_EMAIL", 
    "FIREBASE_ADMIN_PRIVATE_KEY",
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
    "NEXT_PUBLIC_FIREBASE_DATABASE_URL",
    "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"
)

$missingVars = @()
foreach ($var in $requiredEnvVars) {
    if (-not (Test-Path env:$var) -and -not (Get-Content .env.local -ErrorAction SilentlyContinue | Select-String "^$var=")) {
        $missingVars += $var
    }
}

if ($missingVars.Count -gt 0) {
    Write-Host "   ⚠️  Missing environment variables:" -ForegroundColor Yellow
    $missingVars | ForEach-Object { Write-Host "      - $_" -ForegroundColor Red }
    Write-Host "`n   These need to be set in Vercel Dashboard!" -ForegroundColor Cyan
}
else {
    Write-Host "   ✅ All environment variables appear to be set" -ForegroundColor Green
}

# Step 3: Build Test
Write-Host "`n🏗️  Running build test..." -ForegroundColor Yellow
Write-Host "   This ensures the project builds successfully before deployment" -ForegroundColor Cyan
$buildResult = pnpm build
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Build failed! Fix errors before deploying." -ForegroundColor Red
    exit 1
}
Write-Host "   ✅ Build successful!" -ForegroundColor Green

# Step 4: Vercel Deployment Options
Write-Host "`n🎯 DEPLOYMENT OPTIONS:" -ForegroundColor Cyan
Write-Host "   1. Deploy to preview URL (recommended for first deployment)" -ForegroundColor White
Write-Host "   2. Deploy directly to rebuild.4axe.com" -ForegroundColor White
Write-Host "   3. Cancel deployment" -ForegroundColor White

Write-Host "`nSelect option (1-3): " -NoNewline -ForegroundColor Yellow
$choice = Read-Host

switch ($choice) {
    "1" {
        Write-Host "`n📦 Deploying to Vercel preview..." -ForegroundColor Cyan
        vercel --no-clipboard
        Write-Host "`n✅ Preview deployment complete!" -ForegroundColor Green
        Write-Host "   Visit the preview URL to test before aliasing to rebuild.4axe.com" -ForegroundColor Cyan
    }
    "2" {
        Write-Host "`n📦 Deploying directly to rebuild.4axe.com..." -ForegroundColor Cyan
        vercel --prod --no-clipboard
        Write-Host "`n✅ Production deployment complete!" -ForegroundColor Green
        Write-Host "   Your app should be live at https://rebuild.4axe.com" -ForegroundColor Cyan
    }
    "3" {
        Write-Host "`n❌ Deployment cancelled." -ForegroundColor Red
        exit 0
    }
    default {
        Write-Host "`n❌ Invalid option. Deployment cancelled." -ForegroundColor Red
        exit 1
    }
}

# Step 5: Post-deployment steps
Write-Host "`n📋 POST-DEPLOYMENT CHECKLIST:" -ForegroundColor Yellow
Write-Host "   [ ] Verify environment variables in Vercel Dashboard" -ForegroundColor White
Write-Host "   [ ] Configure custom domain (rebuild.4axe.com) in Vercel" -ForegroundColor White
Write-Host "   [ ] Set up domain in Cloudflare:" -ForegroundColor White
Write-Host "       - Type: CNAME" -ForegroundColor DarkGray
Write-Host "       - Name: rebuild" -ForegroundColor DarkGray
Write-Host "       - Content: cname.vercel-dns.com" -ForegroundColor DarkGray
Write-Host "       - Proxy: Yes (Orange cloud)" -ForegroundColor DarkGray
Write-Host "   [ ] Test authentication flow" -ForegroundColor White
Write-Host "   [ ] Test real-time features" -ForegroundColor White
Write-Host "   [ ] Monitor deployment logs" -ForegroundColor White

Write-Host "`n🚀 Deployment process complete!" -ForegroundColor Green
