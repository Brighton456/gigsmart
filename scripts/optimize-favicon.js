const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function optimizeLogo() {
  try {
    // Create optimized versions
    await sharp('assets/gigs-logo.png')
      .resize(32, 32) // Favicon size
      .png({ quality: 80, compressionLevel: 9 })
      .toFile('assets/favicon-32.png');
    
    await sharp('assets/gigs-logo.png')
      .resize(16, 16) // Small favicon
      .png({ quality: 80, compressionLevel: 9 })
      .toFile('assets/favicon-16.png');
    
    await sharp('assets/gigs-logo.png')
      .resize(192, 192) // PWA icon
      .png({ quality: 85, compressionLevel: 8 })
      .toFile('assets/icon-192.png');
    
    await sharp('assets/gigs-logo.png')
      .resize(512, 512) // PWA icon
      .png({ quality: 85, compressionLevel: 8 })
      .toFile('assets/icon-512.png');
    
    // Compressed web version
    await sharp('assets/gigs-logo.png')
      .resize(200, 200) // Reasonable web size
      .png({ quality: 85, compressionLevel: 8 })
      .toFile('assets/gigs-logo-web.png');
    
    console.log('Logo optimization complete!');
  } catch (error) {
    console.error('Error optimizing logo:', error);
  }
}

optimizeLogo();
