@echo off
echo.
echo ===================================
echo YOLO: Installing Profile Extensions
echo ===================================
echo.

REM Core Development
call code --install-extension dbaeumer.vscode-eslint --force
call code --install-extension esbenp.prettier-vscode --force
call code --install-extension bradlc.vscode-tailwindcss --force
call code --install-extension usernamehw.errorlens --force
call code --install-extension yoavbls.pretty-ts-errors --force

REM Git and Tools
call code --install-extension eamodio.gitlens --force
call code --install-extension christian-kohler.path-intellisense --force
call code --install-extension gruntfuggly.todo-tree --force
call code --install-extension chakrounanas.turbo-console-log --force
call code --install-extension streetsidesoftware.code-spell-checker --force

REM React/Next.js
call code --install-extension formulahendry.auto-rename-tag --force
call code --install-extension dsznajder.es7-react-js-snippets --force
call code --install-extension aaron-bond.better-comments --force
call code --install-extension vincaslt.highlight-matching-tag --force
call code --install-extension steoates.autoimport --force

REM Config and Testing
call code --install-extension mikestead.dotenv --force
call code --install-extension wayou.vscode-todo-highlight --force
call code --install-extension naumovs.color-highlight --force
call code --install-extension sleistner.vscode-fileutils --force
call code --install-extension wix.vscode-import-cost --force
call code --install-extension firsttris.vscode-jest-runner --force
call code --install-extension orta.vscode-jest --force

echo.
echo =====================================
echo DONE! All extensions installed!
echo.
echo NEXT STEPS:
echo 1. Go back to VS Code
echo 2. Press F5 to refresh the extension list
echo 3. The Install buttons should now show as installed
echo 4. VS Code will automatically include them in your profile
echo =====================================
echo.
