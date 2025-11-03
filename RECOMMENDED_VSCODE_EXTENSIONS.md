# Recommended VS Code Extensions for EMU Clean Architecture

## 🔴 Critical for Build & TypeScript

### 1. **ESLint** (dbaeumer.vscode-eslint)
- Catches errors in real-time
- Enforces code standards
- Shows inline warnings

### 2. **Prettier** (esbenp.prettier-vscode)
- Auto-formats code on save
- Ensures consistent code style
- Prevents formatting conflicts

### 3. **Error Lens** (usernamehw.errorlens)
- Shows errors/warnings inline
- Highlights problematic lines
- Faster error detection

### 4. **Pretty TypeScript Errors** (yoavbls.pretty-ts-errors)
- Makes TypeScript errors readable
- Shows simplified error messages
- Helps fix complex type issues

## 🟡 Highly Recommended for DX

### 5. **Path Intellisense** (christian-kohler.path-intellisense)
- Autocompletes file paths
- Works with your path aliases
- Prevents import errors

### 6. **Auto Rename Tag** (formulahendry.auto-rename-tag)
- Renames paired HTML/JSX tags
- Prevents mismatched tags
- Saves time

### 7. **GitLens** (eamodio.gitlens)
- Shows git blame inline
- Helps track changes
- Great for collaboration

### 8. **Todo Tree** (gruntfuggly.todo-tree)
- Shows all TODOs in sidebar
- Helps track technical debt
- Organizes tasks

## 🟢 Nice to Have

### 9. **Firebase Extensions**
- **VSFire** (toba.vsfire) - Syntax highlighting
- **Firestore Rules** (firebase.vscode-firestore-rules) - Rules support

### 10. **React/Next.js**
- **ES7+ React Snippets** (dsznajder.es7-react-js-snippets)
- **Simple React Snippets** (burkeholland.simple-react-snippets)

### 11. **Import Management**
- **Auto Import** (steoates.autoimport)
- **Import Sorter** (mike-co.import-sorter)

### 12. **Testing** (When you add tests)
- **Jest** (orta.vscode-jest)
- **Jest Runner** (firsttris.vscode-jest-runner)
- **Coverage Gutters** (ryanluker.vscode-coverage-gutters)

## 🚀 Installation Commands

### Option 1: Install Critical Extensions (Recommended)
```bash
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension usernamehw.errorlens
code --install-extension yoavbls.pretty-ts-errors
```

### Option 2: Install All Recommended
```bash
# Copy and paste all at once
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension usernamehw.errorlens
code --install-extension yoavbls.pretty-ts-errors
code --install-extension christian-kohler.path-intellisense
code --install-extension formulahendry.auto-rename-tag
code --install-extension eamodio.gitlens
code --install-extension gruntfuggly.todo-tree
code --install-extension toba.vsfire
code --install-extension dsznajder.es7-react-js-snippets
code --install-extension steoates.autoimport
```

## 📝 VS Code Settings for These Extensions

Add to your `.vscode/settings.json`:

```json
{
  // ESLint
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  
  // Prettier
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  
  // TypeScript
  "typescript.updateImportsOnFileMove.enabled": "always",
  "typescript.preferences.includePackageJsonAutoImports": "auto",
  
  // Error Lens
  "errorLens.enabledDiagnosticLevels": ["error", "warning"],
  "errorLens.delay": 300,
  
  // Path Intellisense
  "path-intellisense.mappings": {
    "@": "${workspaceFolder}/src",
    "@core": "${workspaceFolder}/src/core",
    "@domain": "${workspaceFolder}/src/core/domain",
    "@application": "${workspaceFolder}/src/core/application",
    "@infrastructure": "${workspaceFolder}/src/infrastructure",
    "@presentation": "${workspaceFolder}/src/presentation"
  }
}
```

## 🎯 Impact on Your Build

These extensions will help by:

1. **Catching TypeScript errors earlier** - Error Lens shows them inline
2. **Auto-fixing common issues** - ESLint can fix many problems automatically
3. **Preventing new errors** - Prettier ensures consistent formatting
4. **Better error messages** - Pretty TS Errors makes them understandable
5. **Faster development** - Path Intellisense prevents import errors

## 💡 Pro Tips

1. **Start with the critical 4** - They'll have the most impact
2. **Configure ESLint to auto-fix on save** - Reduces manual work
3. **Use Error Lens** - You'll see errors immediately without hovering
4. **Pretty TS Errors** - Makes those complex type errors readable

Would you like me to create the VS Code settings file too?
