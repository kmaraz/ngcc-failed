const webpack = require('webpack');
const path = require('path');
const AngularCompilerPlugin = require('@ngtools/webpack').AngularCompilerPlugin;
const BuildOptimizerWebpackPlugin = require('@angular-devkit/build-optimizer')
  .BuildOptimizerWebpackPlugin;

// Main configuration
module.exports = (env, argv) => {
  const isDevelopmentMode = argv.mode === 'development';
  console.log('DEVELOPMENT MODE:', isDevelopmentMode);

  const context = path.resolve(__dirname, './app');

  const angularCompilerPlugin = new AngularCompilerPlugin({
    tsConfigPath: path.join(__dirname, 'tsconfig.aot.json'),
    mainPath: path.join(__dirname, 'app/index'),
    entryModule: path.join(__dirname, 'app/app.module#AppModule'),
  });

  const config = {
    context: context,

    entry: {
      app: path.resolve(context, './index.ts'),
    },

    resolve: {
      modules: ['app', 'node_modules'],
      extensions: ['.ts', '.js', '.mjs', '.css', '.scss'],
    },

    output: {
      filename: '[name].[contenthash].js',
      path: path.join(__dirname, 'dist'),
    },


    plugins: [
    ],

    module: {
      rules: [

      ],
    },
    target: 'web',
  };

  // MODE: DEVELOPMENT
  if (isDevelopmentMode) {
    if (argv.withIvy === true) {
      console.log('Building with Ivy & AOT compilation');
      config.module.rules.push({
        test: /\.ts$/,
        use: ['@ngtools/webpack'],
        exclude: [/node_modules/],
      });
      config.plugins.push(angularCompilerPlugin);
    } else {
      console.log('Building without Ivy & AOT compilation');
      config.module.rules.push({
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: 'tsconfig.json',
              experimentalWatchApi: true,
              transpileOnly: true,
            },
          },
        ],
        exclude: [/node_modules/],
      });
    }
    config.devtool = 'eval-cheap-source-map';
    config.output = {
      filename: '[name].[hash].js',
      path: path.join(__dirname, 'build'),
      pathinfo: false,
    };
    config.profile = false;
    config.plugins.push(new webpack.HotModuleReplacementPlugin());
  }
  // MODE: PRODUCTION
  else {
    config.module.rules.push({
      test: /\.ts$/,
      use: [{ loader: '@ngtools/webpack' }],
      exclude: [/node_modules/],
    });
    config.plugins.push(new webpack.optimize.ModuleConcatenationPlugin());
    config.plugins.push(new webpack.HashedModuleIdsPlugin());
    config.plugins.push(new BuildOptimizerWebpackPlugin());
    config.plugins.push(angularCompilerPlugin);
    // Turn on Bundle Analyzer
  }

  return config;
};
