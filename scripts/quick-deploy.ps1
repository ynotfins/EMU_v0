# Quick Deploy Script for rebuild.4axe.com
# Run this for immediate deployment!

Write-Host "`n🚀 QUICK DEPLOY TO VERCEL" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan

# Check if vercel is installed
$vercelCmd = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelCmd) {
    Write-Host "`n📦 Installing Vercel CLI..." -ForegroundColor Yellow
    pnpm add -g vercel
}

# Quick build check
Write-Host "`n🏗️  Quick build check..." -ForegroundColor Yellow
$env:NODE_ENV = "production"
pnpm build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful!" -ForegroundColor Green
    
    Write-Host "`n🚀 Deploying to Vercel..." -ForegroundColor Cyan
    Write-Host "   Follow the prompts:" -ForegroundColor Yellow
    Write-Host "   - Set up and deploy: Y" -ForegroundColor DarkGray
    Write-Host "   - Which scope: Select your account" -ForegroundColor DarkGray
    Write-Host "   - Link to existing project: N (first time)" -ForegroundColor DarkGray
    Write-Host "   - Project name: emu-clean-architecture" -ForegroundColor DarkGray
    Write-Host "   - Directory: ./" -ForegroundColor DarkGray
    Write-Host "   - Build settings: Accept defaults`n" -ForegroundColor DarkGray
    
    # Run vercel
    vercel
    
    Write-Host "`n✅ Deployment initiated!" -ForegroundColor Green
    Write-Host "`n📝 NEXT STEPS:" -ForegroundColor Yellow
    Write-Host "1. Copy the preview URL from above" -ForegroundColor White
    Write-Host "2. Test the deployment" -ForegroundColor White
    Write-Host "3. If working, run: vercel --prod" -ForegroundColor White
    Write-Host "4. Then alias: vercel alias set [url] rebuild.4axe.com" -ForegroundColor White
}
else {
    Write-Host "`n❌ Build failed! Fix errors first." -ForegroundColor Red
}
