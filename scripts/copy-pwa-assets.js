/**
 * Copies PWA support files into the Expo web export (dist/) after `expo export`.
 * Vercel's build runs this via vercel.json buildCommand.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const dist = path.join(root, 'dist');

if (!fs.existsSync(dist)) {
  console.error(`✖ dist/ not found at ${dist} — run expo export first.`);
  process.exit(1);
}

const copy = (src, dest) => {
  fs.copyFileSync(src, dest);
  console.log(`✔ copied ${path.relative(root, src)} -> ${path.relative(root, dest)}`);
};

// 1. PWA files from public/
const publicDir = path.join(root, 'public');
for (const name of ['manifest.json', 'sw.js']) {
  const src = path.join(publicDir, name);
  if (fs.existsSync(src)) copy(src, path.join(dist, name));
  else console.warn(`⚠ missing ${path.relative(root, src)}`);
}

// 2. Favicons / PWA icons from assets/
const assetsDir = path.join(root, 'assets');
const iconNames = [
  'favicon-16.png',
  'favicon-32.png',
  'favicon.png',
  'icon-192.png',
  'icon-512.png',
];
for (const name of iconNames) {
  const src = path.join(assetsDir, name);
  if (fs.existsSync(src)) copy(src, path.join(dist, 'assets', name));
  else console.warn(`⚠ missing ${path.relative(root, src)}`);
}

// 3. Netlify SPA fallback so deep routes (/login etc.) serve index.html
fs.writeFileSync(path.join(dist, '_redirects'), '/*    /index.html   200\n');
console.log('✔ wrote dist/_redirects (Netlify SPA fallback)');

console.log('✅ PWA assets copied into dist/');
