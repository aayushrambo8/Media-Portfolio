import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function moveFolderSync(srcPath, destPath) {
  if (!fs.existsSync(destPath)) {
    fs.mkdirSync(destPath, { recursive: true });
  }
  
  if (fs.existsSync(srcPath)) {
    const files = fs.readdirSync(srcPath);
    for (const file of files) {
      const srcFile = path.join(srcPath, file);
      const destFile = path.join(destPath, file);
      if (fs.statSync(srcFile).isDirectory()) {
        moveFolderSync(srcFile, destFile);
      } else {
        fs.renameSync(srcFile, destFile);
      }
    }
  }
}

try {
  // Create components directory
  if (!fs.existsSync(path.join(__dirname, 'src/components'))) {
    fs.mkdirSync(path.join(__dirname, 'src/components'), { recursive: true });
  }

  // Move UI and figma components
  const componentsPath = path.join(__dirname, 'src/app/components');
  const newComponentsPath = path.join(__dirname, 'src/components');
  
  if (fs.existsSync(componentsPath)) {
    const items = fs.readdirSync(componentsPath);
    for (const item of items) {
      if (['ui', 'figma', 'Navbar.tsx'].includes(item)) {
        const srcItem = path.join(componentsPath, item);
        const destItem = path.join(newComponentsPath, item);
        fs.renameSync(srcItem, destItem);
      }
    }
  }
  
  // create required Next.js directories
  fs.mkdirSync(path.join(__dirname, 'src/app/about'), { recursive: true });
  fs.mkdirSync(path.join(__dirname, 'src/app/gallery'), { recursive: true });
  
  console.log('Migration setup successful');
} catch (error) {
  console.error('Error during setup:', error);
}
