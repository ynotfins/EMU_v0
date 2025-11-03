const fs = require('fs');
const path = require('path');

// Files that have UTF-8 encoding issues
const problematicFiles = [
  'src/app/admin/page.tsx',
  'src/components/features/god-mode-card.tsx',
  'src/components/features/supe-controls-card.tsx'
];

// Emoji replacements
const emojiReplacements = {
  '👷': 'CHASER',
  '👮': 'SUPE',
  '🔧': '[ADMIN]',
  '👑': '[SUPER]',
  '✅': '[OK]',
  '❌': '[X]',
  '🚨': '[ALERT]',
  '📍': '[LOC]',
  '🗺️': '[MAP]',
  '💬': '[MSG]',
  '📸': '[PHOTO]',
  '📝': '[DOC]',
  '🔍': '[SEARCH]',
  '⚠️': '[WARN]',
  '💾': '[SAVE]',
  '🔄': '[SYNC]',
  '🚀': '[LAUNCH]',
  '🎯': '[TARGET]',
  '📊': '[STATS]',
  '⚡': '[FAST]',
  '🔐': '[SECURE]',
  '📋': '[LIST]',
  '✏️': '[EDIT]',
  '🗑️': '[DELETE]',
  '➕': '[ADD]',
  '🏠': '[HOME]',
  '🔔': '[NOTIF]',
  '⏰': '[TIME]',
  '📌': '[PIN]',
  '🎨': '[STYLE]',
  '💡': '[IDEA]',
  '🐛': '[BUG]',
  '🏗️': '[BUILD]',
  '📦': '[PKG]',
  '🔗': '[LINK]',
  '📱': '[MOBILE]',
  '💻': '[DESKTOP]',
  '🌐': '[WEB]',
  '🛠️': '[TOOLS]',
  '📡': '[API]',
  '🗄️': '[DB]',
  '🔥': '[FIRE]',
  '✨': '[NEW]',
  '🎁': '[FEAT]',
  '🛡️': '[SHIELD]',
  '⭐': '[STAR]',
  '❤️': '[HEART]',
  '👍': '[GOOD]',
  '👎': '[BAD]',
  '✋': '[STOP]',
  '👉': '[POINT]',
  '🔑': '[KEY]',
  '📈': '[UP]',
  '📉': '[DOWN]',
  '🏃': '[RUN]',
  '🌍': '[WORLD]',
  '📆': '[DATE]',
  '⏱️': '[TIMER]',
  '💰': '[MONEY]',
  '📞': '[PHONE]',
  '📧': '[EMAIL]',
  '🔒': '[LOCKED]',
  '☁️': '[CLOUD]',
  '⚙️': '[CONFIG]'
};

function cleanContent(content) {
  let cleaned = content;
  for (const [emoji, replacement] of Object.entries(emojiReplacements)) {
    cleaned = cleaned.replace(new RegExp(emoji, 'g'), replacement);
  }
  return cleaned;
}

console.log('Fixing UTF-8 encoding issues...');

// Fix problematic files
for (const filePath of problematicFiles) {
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const cleanedContent = cleanContent(content);
      fs.writeFileSync(filePath, cleanedContent, 'utf8');
      console.log(`✓ Cleaned and re-encoded: ${filePath}`);
    } catch (error) {
      console.error(`✗ Error processing ${filePath}:`, error.message);
    }
  } else {
    console.log(`⚠ File not found: ${filePath}`);
  }
}

// Scan all src files for emojis
function scanDirectory(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  let filesWithEmojis = 0;
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      filesWithEmojis += scanDirectory(fullPath);
    } else if (file.name.match(/\.(ts|tsx|js|jsx)$/)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const cleanedContent = cleanContent(content);
        
        if (content !== cleanedContent) {
          fs.writeFileSync(fullPath, cleanedContent, 'utf8');
          console.log(`✓ Cleaned emojis from: ${file.name}`);
          filesWithEmojis++;
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }
  }
  
  return filesWithEmojis;
}

console.log('\nScanning all files for emojis...');
const totalCleaned = scanDirectory('src');

console.log(`\nUTF-8 encoding fixes completed!`);
console.log(`Total files cleaned: ${totalCleaned}`);
