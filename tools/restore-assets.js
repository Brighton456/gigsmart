const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const assetsDir = path.join(__dirname, '..', 'assets');
fs.mkdirSync(assetsDir, { recursive: true });

const hexToRgb = (hex) => {
  const cleaned = hex.replace('#', '');
  const bigint = parseInt(cleaned, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
};

const createSolidPng = (width, height, colorHex, fileName) => {
  const png = new PNG({ width, height });
  const { r, g, b } = hexToRgb(colorHex);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = (width * y + x) << 2;
      png.data[idx] = r;
      png.data[idx + 1] = g;
      png.data[idx + 2] = b;
      png.data[idx + 3] = 255; // fully opaque
    }
  }

  const filePath = path.join(assetsDir, fileName);
  const buffer = PNG.sync.write(png);
  fs.writeFileSync(filePath, buffer);
};

createSolidPng(512, 512, '#1e40af', 'icon.png');
createSolidPng(1024, 1024, '#1d4ed8', 'adaptive-icon.png');
createSolidPng(2048, 2048, '#0ea5e9', 'splash.png');
createSolidPng(64, 64, '#111827', 'favicon.png');

console.log('Generated solid color Expo asset images.');
