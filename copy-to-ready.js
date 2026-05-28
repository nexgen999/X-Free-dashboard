import fs from 'fs';
import path from 'path';

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

const source = path.join(process.cwd(), 'dist');
const destination = path.join(process.cwd(), 'Ready.To.Use');

console.log(`Copying from ${source} to ${destination} ...`);
try {
  if (fs.existsSync(destination)) {
    fs.rmSync(destination, { recursive: true, force: true });
  }
  copyRecursiveSync(source, destination);
  console.log('Static PWA assets successfully copied to Ready.To.Use folder!');
} catch (error) {
  console.error('Error copying static assets:', error);
}
