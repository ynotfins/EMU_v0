# Manual Extension Install Guide

## ✅ Yes, Cursor CAN Install VS Code Extensions!

Cursor is built on VS Code and supports most VS Code extensions.

---

## 🎯 Three Ways to Install Extensions in Cursor

### Method 1: Search in Cursor (Easiest)

1. Press `Ctrl+Shift+X` to open Extensions
2. Search: **"Disable Extensions"**
3. Look for: `muzaisimao.vscode-disable-extensions`
4. Click **Install**

**If you can't find it**, try Methods 2 or 3.

---

### Method 2: Import from VS Code

If you have VS Code installed with this extension:

1. Open Cursor Settings: `Ctrl+Shift+J`
2. Go to: **General → Account**
3. Click: **"Import from VS Code"**
4. This imports all extensions, themes, settings, keybindings

---

### Method 3: Manual VSIX Install

If the extension isn't in Cursor's marketplace:

1. **Download VSIX**:
   - Go to: https://marketplace.visualstudio.com/items?itemName=muzaisimao.vscode-disable-extensions
   - Click: **"Download Extension"** (right side of page)
   - Or use direct link: https://marketplace.visualstudio.com/_apis/public/gallery/publishers/muzaisimao/vsextensions/vscode-disable-extensions/latest/vspackage
   - Save as: `disable-extensions.vsix`

2. **Install in Cursor**:
   - Press `Ctrl+Shift+X` to open Extensions
   - Click **"..."** (three dots menu at top)
   - Select: **"Install from VSIX..."**
   - Browse to downloaded `.vsix` file
   - Click **Open**

3. **Reload Cursor**:
   - Press `Ctrl+Shift+P`
   - Type: **"Reload Window"**
   - Hit Enter

---

## 🎯 After Installing "Disable Extensions"

The extension will read `.vscode/ext.config.json` and automatically disable the 26 unwanted extensions listed there.

**Check it worked**:
1. Open Extensions (`Ctrl+Shift+X`)
2. Should see:
   - ✅ ~9-10 enabled (ESLint, Tailwind, Prettier, etc.)
   - ❌ ~26 disabled (Python, Java, Docker, etc.)

---

## ⚠️ If Extension Doesn't Exist

If you can't find `muzaisimao.vscode-disable-extensions` anywhere:

**Fallback**: Manual disable (5 minutes)
- See: `docs/HOW_TO_DISABLE_EXTENSIONS_CURSOR.md`
- Quick method: Search by category and batch-disable
- Still gets the same performance boost

---

## 📝 What We've Set Up

1. **`.vscode/ext.config.json`**: Lists 26 extensions to auto-disable
2. **`.vscode/settings.json`**: Has aggressive feature disables as backup
3. **`.vscode/extensions.json`**: Recommends keeping 9 essential extensions

**All three work together** for optimal Cursor performance!

---

## 🚀 Next Steps

1. **Try Method 1**: Search in Cursor Extensions
2. **If not found**: Try Method 3 (manual VSIX install)
3. **If still fails**: Use manual disable method from other guide

The end goal is the same: **9 enabled, 26 disabled** for maximum performance!

