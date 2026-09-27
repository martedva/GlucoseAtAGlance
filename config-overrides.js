const { override, addWebpackResolve } = require('customize-cra');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const overrideEntry = (config) => {
  config.entry = {
    main: './src/popup', // the extension UI
    background: './src/background',
  };

  return config;
};

const overrideOutput = (config) => {
  config.output = {
    ...config.output,
    filename: 'static/js/[name].js',
    chunkFilename: 'static/js/[name].js',
  };

  return config;
};

const overrideResolve = (config) => {
  config.resolve = {
    ...config.resolve,
    plugins: [
      ...(config.resolve.plugins || []),
      new TsconfigPathsPlugin({
        configFile: './tsconfig.json',
      }),
    ],
  };
  return config;
};

const overridePlugins = (config) => {
  config.plugins.push(
    new CopyWebpackPlugin({
      patterns: [
        { from: 'assets/icons/*.png', to: 'static/assets/icons/[name][ext]' },
      ],
    })
  );

  return config;
};

module.exports = function webpack(config) {
  return override(overrideEntry, overrideOutput, overrideResolve, overridePlugins)(config);
};