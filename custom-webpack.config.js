const { withUnimodules } = require('@expo/webpack-config/addons');

module.exports = ({ config, ...env }) => {
  // Rely on Expo's managed Webpack config and avoid custom runtime splitting
  return withUnimodules(config, { ...env, projectRoot: __dirname });
};
