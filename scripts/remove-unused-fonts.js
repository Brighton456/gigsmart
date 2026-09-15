const fs = require('fs');
const path = require('path');

const webBuildDir = path.join(__dirname, '../web-build/assets');
const fontsToKeep = ['Ionicons.ttf'];
const headersPath = path.join(__dirname, '../web-build/_headers');
const redirectsPath = path.join(__dirname, '../web-build/_redirects');

const ensureIoniconsAtRoot = () => {
  const source = path.join(__dirname, '../node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf');
  const target = path.join(webBuildDir, 'Ionicons.ttf');

  try {
    fs.copyFileSync(source, target);
    console.log('Copied Ionicons.ttf to web-build/assets for direct serving.');
  } catch (err) {
    console.warn('Could not copy Ionicons.ttf', err.message);
  }
};

if (fs.existsSync(webBuildDir)) {
  ensureIoniconsAtRoot();

  const files = fs.readdirSync(webBuildDir, { withFileTypes: true });
  
  files.forEach(file => {
    if (file.isDirectory()) {
      const fontDir = path.join(webBuildDir, file.name);
      
      if (file.name === '@expo' && file.isDirectory()) {
        // Navigate to the fonts directory
        const vectorIconsDir = path.join(fontDir, 'vector-icons', 'build', 'vendor', 'react-native-vector-icons', 'Fonts');
        
        if (fs.existsSync(vectorIconsDir)) {
          const fontFiles = fs.readdirSync(vectorIconsDir);
          
          fontFiles.forEach(fontFile => {
            if (fontFile.endsWith('.ttf') && !fontsToKeep.includes(fontFile)) {
              const fontPath = path.join(vectorIconsDir, fontFile);
              fs.unlinkSync(fontPath);
              console.log(`Removed unused font: ${fontFile}`);
            }
          });
        }
      }
    }
  });
  
  // Write Netlify _headers to guarantee correct MIME/CORS for fonts
  try {
    fs.writeFileSync(
      headersPath,
      `/assets/Ionicons.ttf\n  Content-Type: font/ttf\n  Cache-Control: public, max-age=31536000, immutable\n  Access-Control-Allow-Origin: *\n`
    );
    console.log('Wrote _headers for Ionicons.ttf');
  } catch (err) {
    console.warn('Could not write _headers', err.message);
  }

  // Write Netlify _redirects to map Expo node_modules font path to our copied font
  try {
    fs.writeFileSync(
      redirectsPath,
      `/assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf /assets/Ionicons.ttf 200\n`
    );
    console.log('Wrote _redirects for Ionicons.ttf');
  } catch (err) {
    console.warn('Could not write _redirects', err.message);
  }

  console.log('Font cleanup complete!');
} else {
  console.log('web-build directory not found');
}
