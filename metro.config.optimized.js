const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Only include Ionicons font - exclude all other icon fonts
config.resolver.assetExts = config.resolver.assetExts.filter(ext => 
  !ext.includes('ttf') || ext.includes('Ionicons')
);

// Custom resolver to exclude unnecessary fonts
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Block all icon fonts except Ionicons
  if (moduleName.includes('@expo/vector-icons') && 
      !moduleName.includes('Ionicons') && 
      !moduleName.includes('build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf')) {
    return { type: 'empty' };
  }
  
  return context.resolveRequest(context, moduleName, platform);
};

// Optimize Metro for web builds
config.transformer.minifierConfig = {
  keep_fnames: false,
  mangle: {
    keep_fnames: false,
  },
  compress: {
    drop_console: true,
    drop_debugger: true,
    pure_funcs: ['console.log', 'console.warn', 'console.error'],
  },
  output: {
    comments: false,
  },
};

// Enable code splitting and reduce bundle size
config.resolver.assetExts.push(['bin', 'txt', 'md', 'csv', 'xml']);

// Optimize asset processing
config.transformer.assetRegistryPath = require.resolve('react-native/Libraries/Image/AssetRegistry');

module.exports = config;
