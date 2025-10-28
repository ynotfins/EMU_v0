# Download and install the Disable Extensions extension for Cursor
# This extension allows workspace-level extension disabling via config file

$extensionId = "muzaisimao.vscode-disable-extensions"
$version = "2.0.1"
$vsixUrl = "https://marketplace.visualstudio.com/_apis/public/gallery/publishers/muzaisimao/vsextensions/vscode-disable-extensions/$version/vspackage"
$vsixPath = "$PSScriptRoot\disable-extensions.vsix"

Write-Host "Downloading $extensionId v$version..." -ForegroundColor Cyan

try {
    # Download VSIX
    Invoke-WebRequest -Uri $vsixUrl -OutFile $vsixPath -UseBasicParsing
    Write-Host "Downloaded to $vsixPath" -ForegroundColor Green

    # Try Cursor first
    Write-Host "`nInstalling in Cursor..." -ForegroundColor Cyan
    $cursorInstall = & cursor --install-extension $vsixPath 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Installed in Cursor!" -ForegroundColor Green
    } else {
        # Fallback to code command
        Write-Host "Cursor CLI failed, trying code command..." -ForegroundColor Yellow
        $codeInstall = & code --install-extension $vsixPath 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Installed in VS Code/Cursor!" -ForegroundColor Green
        } else {
            Write-Host "CLI install failed. Manual install required:" -ForegroundColor Red
            Write-Host "   1. Open Cursor Extensions (Ctrl+Shift+X)" -ForegroundColor Yellow
            Write-Host "   2. Click ... menu -> Install from VSIX..." -ForegroundColor Yellow
            Write-Host "   3. Select: $vsixPath" -ForegroundColor Yellow
        }
    }

    Write-Host "`nAfter installation:" -ForegroundColor Cyan
    Write-Host "   1. Reload Cursor (Ctrl+Shift+P -> Reload Window)" -ForegroundColor White
    Write-Host "   2. Extensions in .vscode/ext.config.json will auto-disable" -ForegroundColor White
    Write-Host "   3. Check Extensions panel - should see ~9 enabled ~26 disabled" -ForegroundColor White

} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host "`nManual download:" -ForegroundColor Yellow
    Write-Host "   URL: $vsixUrl" -ForegroundColor White
    Write-Host "   Save as: disable-extensions.vsix" -ForegroundColor White
}

# Keep VSIX for manual install if needed
Write-Host "`nVSIX file saved at: $vsixPath" -ForegroundColor Cyan
Write-Host "   (You can delete this after successful install)" -ForegroundColor Gray
