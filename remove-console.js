const fs = require('fs');
const path = require('path');

// Function to remove console statements from a file
function removeConsoleFromFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove console.log statements
    content = content.replace(/console\.log\([^)]*\);?\s*/g, '');
    
    // Remove console.error statements  
    content = content.replace(/console\.error\([^)]*\);?\s*/g, '');
    
    // Remove console.warn statements
    content = content.replace(/console\.warn\([^)]*\);?\s*/g, '');
    
    // Remove console.info statements
    content = content.replace(/console\.info\([^)]*\);?\s*/g, '');
    
    // Remove console.debug statements
    content = content.replace(/console\.debug\([^)]*\);?\s*/g, '');
    
    fs.writeFileSync(filePath, content);
    console.log(`Cleaned: ${filePath}`);
  } catch (error) {
    console.log(`Error cleaning ${filePath}:`, error.message);
  }
}

// Function to recursively find and clean JS files
function cleanDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && item !== 'node_modules') {
      cleanDirectory(fullPath);
    } else if (item.endsWith('.js') && !item.includes('remove-console.js')) {
      removeConsoleFromFile(fullPath);
    }
  }
}

// Start cleaning from current directory
cleanDirectory('.');
console.log('✅ Console statements removed from all JS files');
