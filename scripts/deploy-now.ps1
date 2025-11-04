# EMU Quick Deploy Script for rebuild.4axe.com
# This script handles the initial Vercel setup and deployment

Write-Host "🚀 EMU Deployment to rebuild.4axe.com" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Not in project root directory" -ForegroundColor Red
    exit 1
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    pnpm install
}

# Run pre-build check
Write-Host "`n🔍 Running pre-build checks..." -ForegroundColor Yellow
pnpm check
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Pre-build checks failed. Fix errors before deploying." -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Pre-build checks passed!" -ForegroundColor Green

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "`n⚠️  Warning: .env.local not found" -ForegroundColor Yellow
    Write-Host "Make sure to set environment variables in Vercel Dashboard!" -ForegroundColor Yellow
}

# Deploy with Vercel
Write-Host "`n🚢 Starting Vercel deployment..." -ForegroundColor Cyan
Write-Host "Follow the prompts to set up your project." -ForegroundColor Yellow
Write-Host "When asked for project name, use: emu-rebuild" -ForegroundColor Yellow

# Run vercel deployment
npx vercel

Write-Host "`n✅ Deployment initiated!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Go to Vercel Dashboard: https://vercel.com/dashboard" -ForegroundColor White
Write-Host "2. Add environment variables (see DEPLOYMENT_SETUP_GUIDE.md)" -ForegroundColor White
Write-Host "3. Connect domain rebuild.4axe.com" -ForegroundColor White
Write-Host "4. Visit your deployed site!" -ForegroundColor White

Write-Host "`n📚 Full guide: DEPLOYMENT_SETUP_GUIDE.md" -ForegroundColor Yellow
