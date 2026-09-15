const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Convert an image to WebP using sharp via npx.
 * Falls back to copying if conversion fails to avoid breaking builds.
 * @param {string} filePath
 */
const convertToWebP = (filePath) => {
  const ext = path.extname(filePath);
  const webpPath = filePath.replace(ext, '.webp');

  try {
    execSync(`npx sharp "${filePath}" "${webpPath}" --format=webp --quality=80`, {
      stdio: 'ignore',
    });
    console.log(`Converted ${path.basename(filePath)} → ${path.basename(webpPath)}`);
  } catch (error) {
    console.warn(`sharp conversion failed for ${filePath}. Copying as fallback.`);
    fs.copyFileSync(filePath, webpPath);
  }
};

const assetsDir = path.join(__dirname, '../assets');

if (fs.existsSync(assetsDir)) {
  fs.readdirSync(assetsDir).forEach((file) => {
    if (file.match(/\.(png|jpg|jpeg)$/i)) {
      convertToWebP(path.join(assetsDir, file));
    }
  });
} else {
  console.warn('Assets directory not found for WebP conversion.');
}

console.log('WebP conversion pass complete.');
