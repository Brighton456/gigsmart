const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Ensure Metro can locate packages when using pnpm's node_modules layout
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(__dirname, 'node_modules/.pnpm')
];

if (config?.resolver?.sourceExts) {
  config.resolver.sourceExts = Array.from(
    new Set([...config.resolver.sourceExts, 'mjs', 'cjs'])
  );
}

if (config?.resolver?.assetExts) {
  config.resolver.assetExts = Array.from(
    new Set([...config.resolver.assetExts, 'bin', 'txt', 'md', 'csv', 'xml'])
  );
}

config.transformer.minifierConfig = {
  keep_fnames: false,
  mangle: {
    keep_fnames: false,
  },
  compress: {
    drop_console: false,
    drop_debugger: false,
    pure_funcs: [],
  },
  output: {
    comments: false,
  },
};

config.transformer.assetRegistryPath = require.resolve(
  'react-native/Libraries/Image/AssetRegistry'
);

module.exports = config;
