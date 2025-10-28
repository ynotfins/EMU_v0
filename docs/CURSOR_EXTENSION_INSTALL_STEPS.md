# Install "Disable Extensions" in Cursor - Exact Steps

## 📥 Step 1: Download the VSIX File

1. **Open this link in your browser**:
   https://marketplace.visualstudio.com/items?itemName=muzaisimao.vscode-disable-extensions

2. **Look on the RIGHT side of the page** for a section called "Resources"

3. **Click "Download Extension"** (it's a link in that Resources box)
   - This downloads a file named something like: `muzaisimao.vscode-disable-extensions-2.0.1.vsix`
   - It will save to your Downloads folder

4. **Remember where it saved** (probably `C:\Users\[YourName]\Downloads\`)

---

## 📦 Step 2: Install VSIX in Cursor

### Finding "Install from VSIX..." in Cursor:

1. **Open Cursor** (not VS Code!)

2. **Open Extensions Panel**:
   - Press `Ctrl+Shift+X`
   - OR click the Extensions icon (4 squares) on the left sidebar

3. **Look at the TOP of the Extensions panel** - you'll see:
   - A search box
   - Three icons on the right side of the search box

4. **Click the THREE DOTS icon** `⋯` (ellipsis/kebab menu)
   - It's the rightmost icon at the top of the Extensions panel
   - Right next to the search box

5. **A menu will drop down** with options:
   ```
   ✓ Check for Extension Updates
   ✓ Enable All Extensions
   ✓ Disable All Extensions
   ✓ Install from VSIX...          ← Click this one!
   ✓ Show Built-in Extensions
   ✓ Show Recommended Extensions
   ```

6. **Click "Install from VSIX..."**

7. **A file browser will open** - navigate to your Downloads folder

8. **Select the VSIX file** you downloaded:
   - Look for: `muzaisimao.vscode-disable-extensions-[version].vsix`
   - Click it, then click **Open**

9. **Wait for installation** - you'll see a notification in the bottom-right corner

10. **Reload Cursor**:
    - Press `Ctrl+Shift+P`
    - Type: "Reload Window"
    - Press Enter

---

## ✅ Step 3: Verify It Worked

After reloading:

1. **Open Extensions** (`Ctrl+Shift+X`)

2. **Check the counts**:
   - Should see **~10 enabled** (ESLint, Tailwind, Prettier, etc.)
   - Should see **~26 disabled** (Python, Java, Docker, etc.)

3. **Look for disabled extensions**:
   - Filter by typing `@disabled` in the search box
   - Should see Python, Java, Docker, etc. all disabled

---

## 🖼️ Visual Guide

```
┌─────────────────────────────────────────────┐
│  Extensions: Marketplace                   │
│  ┌────────────────────────────┐  🔍 ⚙️ ⋯   │  ← Three dots here!
│  │ Search Extensions         │            │
│  └────────────────────────────┘            │
│                                             │
│  Click the ⋯ (three dots) icon             │
│  Then select: "Install from VSIX..."       │
└─────────────────────────────────────────────┘
```

---

## ⚠️ Common Issues

### "I can't find the three dots"
- Make sure you're in Cursor, not VS Code
- The Extensions panel must be open (`Ctrl+Shift+X`)
- Look at the TOP-RIGHT of the Extensions panel, next to the search box

### "Install from VSIX... is grayed out"
- Close and reopen Cursor
- Try running Cursor as Administrator

### "I can't find the VSIX file"
- Check your Downloads folder: `C:\Users\[YourName]\Downloads\`
- Look for files ending in `.vsix`
- If not there, try downloading again from the marketplace

---

## 🆘 If This Still Doesn't Work

**Fallback Option**: Manual disable (5 minutes)

See: `docs/HOW_TO_DISABLE_EXTENSIONS_CURSOR.md`

This gets the same result without needing the extension:
- Search "python" in Extensions → Disable all
- Search "java" → Disable all
- Search "docker" → Disable all
- etc.

Same performance boost, just manual instead of automated.

