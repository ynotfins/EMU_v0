# Manual Vercel Deployment Steps

Write-Host "=== VERCEL DEPLOYMENT GUIDE ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Login to Vercel" -ForegroundColor Yellow
Write-Host "Run this command and follow the browser prompt:" -ForegroundColor White
Write-Host "npx vercel login" -ForegroundColor Green
Write-Host ""

Write-Host "Step 2: Deploy the Project" -ForegroundColor Yellow
Write-Host "After logging in, run:" -ForegroundColor White
Write-Host "npx vercel" -ForegroundColor Green
Write-Host ""

Write-Host "Step 3: Answer the Prompts" -ForegroundColor Yellow
Write-Host "- Set up and deploy? > Y" -ForegroundColor White
Write-Host "- Which scope? > Select your account" -ForegroundColor White
Write-Host "- Link to existing project? > N" -ForegroundColor White
Write-Host "- Project name? > emu-rebuild" -ForegroundColor White
Write-Host "- Directory? > . (just press Enter)" -ForegroundColor White
Write-Host "- Want to modify settings? > N" -ForegroundColor White
Write-Host ""

Write-Host "Step 4: Connect Your Domain" -ForegroundColor Yellow
Write-Host "After deployment, run:" -ForegroundColor White
Write-Host "npx vercel domains add rebuild.4axe.com" -ForegroundColor Green
Write-Host ""

Write-Host "Step 5: Set Environment Variables" -ForegroundColor Yellow
Write-Host "Go to: https://vercel.com/dashboard" -ForegroundColor White
Write-Host "Navigate to your project > Settings > Environment Variables" -ForegroundColor White
Write-Host ""

Write-Host "Need help? Check DEPLOYMENT_SETUP_GUIDE.md" -ForegroundColor Cyan
