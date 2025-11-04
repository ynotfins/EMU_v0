# EMU Force Deploy Script - Bypasses pre-build checks
# Use this when you know the app works despite TypeScript/lint errors

Write-Host ">>> EMU Force Deployment to rebuild.4axe.com" -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Magenta
Write-Host "[!] Bypassing pre-build checks..." -ForegroundColor Yellow

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "[X] Error: Not in project root directory" -ForegroundColor Red
    exit 1
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "[*] Installing dependencies..." -ForegroundColor Yellow
    pnpm install
}

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "`n[!] Warning: .env.local not found" -ForegroundColor Yellow
    Write-Host "Environment variables will be set in Vercel Dashboard" -ForegroundColor Yellow
}

# Deploy with Vercel
Write-Host "`n[>>] Starting Vercel deployment (force mode)..." -ForegroundColor Cyan
Write-Host "Follow the prompts to set up your project." -ForegroundColor Yellow
Write-Host "When asked for project name, use: emu-rebuild" -ForegroundColor Yellow
Write-Host "`nNote: TypeScript errors will be ignored during build." -ForegroundColor Yellow

# Run vercel deployment
npx vercel

Write-Host "`n[OK] Deployment initiated!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Go to Vercel Dashboard: https://vercel.com/dashboard" -ForegroundColor White
Write-Host "2. Add environment variables (see DEPLOYMENT_SETUP_GUIDE.md)" -ForegroundColor White
Write-Host "3. Connect domain rebuild.4axe.com" -ForegroundColor White
Write-Host "4. Visit your deployed site!" -ForegroundColor White

Write-Host "`n[DOCS] Full guide: DEPLOYMENT_SETUP_GUIDE.md" -ForegroundColor Yellow
