const { override, addWebpackResolve, addWebpackModuleRule, enableSourceMaps } = require('customize-cra');
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
    chunkFilename: 'static/js/[name].chunk.js',
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

const optimizeProduction = (config, env) => {
  if (env === 'production') {
    // Disable source maps for production to reduce bundle size
    config.devtool = false;

    // Optimize Terser settings for smaller bundles
    if (config.optimization?.minimizer) {
      config.optimization.minimizer.forEach((minimizer) => {
        if (minimizer.options?.terserOptions) {
          minimizer.options.terserOptions = {
            ...minimizer.options.terserOptions,
            compress: {
              ...minimizer.options.terserOptions.compress,
              drop_console: true, // Remove console.log in production
              drop_debugger: true,
            },
          };
        }
      });
    }
  }

  return config;
};

module.exports = function webpack(config, env) {
  return override(
    overrideEntry,
    overrideOutput,
    overrideResolve,
    overridePlugins,
    optimizeProduction
  )(config, env);
};