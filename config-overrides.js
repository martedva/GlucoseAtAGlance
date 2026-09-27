const { override } = require('customize-cra');
const CopyWebpackPlugin = require('copy-webpack-plugin');

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
  return override(overrideEntry, overrideOutput, overridePlugins)(config);
}