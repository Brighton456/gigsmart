const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Custom resolver to exclude all fonts except Ionicons
const originalResolver = config.resolver.resolve;

config.resolver.resolve = (context, moduleName, platform) => {
  // Block all icon fonts except Ionicons
  if (moduleName.includes('@expo/vector-icons') && 
      !moduleName.includes('Ionicons')) {
    return {
      filePath: require.resolve('expo-asset/build/AssetRegistry'),
      type: 'sourceFile',
    };
  }
  
  return originalResolver(context, moduleName, platform);
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

module.exports = config;
