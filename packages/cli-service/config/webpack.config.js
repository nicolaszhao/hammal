const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const InterpolateHtmlPlugin = require('../utils/InterpolateHtmlPlugin');
const config = require('../utils/configHelper');
const getClientEnvironment = require('./env');
const paths = require('./paths');

const {
  publicUrl = '/',
  outputDir = 'dist',
  filenameHashing = true,
  sourceMap = false,
  pages,

  // css.modules, css.loaderOptions.sass
  css = {},
  devServer = {},
  configureWebpack = {},
} = config;

const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const sassRegex = /\.(scss|sass)$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;

module.exports = (webpackEnv) => {
  const isEnvDevelopment = webpackEnv.development;
  const isEnvProduction = webpackEnv.production;
  const outputFilename = isEnvDevelopment || !filenameHashing ? '[name]' : '[name].[contenthash:5]';

  const getStyleLoaders = (cssOptions = {}, preProcessor) => {
    const { modules, ...otherCssOptions } = cssOptions;
    const loaders = [
      isEnvDevelopment ? require.resolve('style-loader') : MiniCssExtractPlugin.loader,
      {
        loader: require.resolve('css-loader'),
        options: {
          importLoaders: !preProcessor ? 2 : 3,
          sourceMap: isEnvProduction && sourceMap,
          modules: modules ? { localIdentName: '[folder]-[local]__[hash:base64:5]' } : false,
          ...otherCssOptions,
        },
      },
      {
        loader: require.resolve('postcss-loader'),
        options: {
          ident: 'postcss',
          plugins: () => [

            // includes autoprefixer
            require('postcss-preset-env')(),

            // includes sanitize.css, use @import-sanitize
            require('postcss-normalize')(),
          ],
          sourceMap: isEnvProduction && sourceMap,
        },
      },
      require.resolve('resolve-url-loader'),
    ];

    if (preProcessor) {
      loaders.push({
        loader: require.resolve(preProcessor.loader),
        options: {
          sourceMap: isEnvProduction && sourceMap,
          ...preProcessor.options,
        },
      });
    }

    return loaders;
  };
  const getHtmlWebpackPlugins = () => {
    const defaultTemplate = path.resolve(paths.appPublic, 'index.html');
    const indexPageNames = ['index', 'main', 'home', 'homepage'];

    if (!pages) {
      return [new HtmlWebpackPlugin({
        template: defaultTemplate,
      })];
    }

    const chunks = Object.keys(pages);

    return chunks.reduce((ret, chunk) => {
      const chunkPath = path.resolve(paths.appPath, pages[chunk]);

      if (fs.existsSync(chunkPath)) {
        const filename = indexPageNames.includes(chunk) ? 'index.html' : `${chunk}.html`;
        let template = path.resolve(paths.appPublic, filename);

        if (!fs.existsSync(template)) {
          template = defaultTemplate;
        }

        ret.push(new HtmlWebpackPlugin({
          filename,
          template,

          // TODO: 还需要验证是否需要这样配置
          chunks: [chunk],
        }));
      }

      return ret;
    }, []);
  };

  const publicPath = isEnvDevelopment
    ? '/'
    : publicUrl.endsWith('/')
      ? publicUrl
      : `${publicUrl}/`;

  const env = getClientEnvironment(publicPath);

  const webpackConfig = {
    mode: isEnvProduction ? 'production' : 'development',
    entry: pages || { main: path.resolve(paths.appSrc, 'index.js') },
    output: {
      path: isEnvProduction ? path.resolve(paths.appPath, outputDir) : undefined,
      filename: `static/js/${outputFilename}.js`,
      chunkFilename: `static/js/${outputFilename}.chunk.js`,
      publicPath: isEnvDevelopment ? '/' : '',
    },
    optimization: {
      minimize: !webpackEnv.nominimize,
      minimizer: [
        new TerserJSPlugin({
          cache: true,
          parallel: true,
          sourceMap,
        }),
        new OptimizeCSSAssetsPlugin(),
      ],
      runtimeChunk: 'single',
      splitChunks: {
        chunks: 'all',
        name: false,
      },
    },
    module: {
      rules: [
        {
          oneOf: [
            {
              test: /\.jsx?$/,
              include: paths.appSrc,
              loader: require.resolve('babel-loader'),
              options: {
                cacheDirectory: true,
              },
            },
            {
              test: cssRegex,
              exclude: !css.modules ? cssModuleRegex : undefined,
              use: getStyleLoaders({
                modules: css.modules,
              }),
            },
            !css.modules && {
              test: cssModuleRegex,
              use: getStyleLoaders({
                modules: true,
              }),
            },
            {
              test: sassRegex,
              exclude: !css.modules ? sassModuleRegex : undefined,
              use: getStyleLoaders(
                {
                  modules: css.modules,
                },
                {
                  loader: 'sass-loader',
                  options: css.loaderOptions && css.loaderOptions.sass,
                },
              ),
            },
            !css.modules && {
              test: sassModuleRegex,
              use: getStyleLoaders(
                {
                  modules: true,
                },
                {
                  loader: 'sass-loader',
                  options: css.loaderOptions && css.loaderOptions.sass,
                },
              ),
            },
            {
              test: /\.(?:jpe?g|png|gif)$/,
              loader: require.resolve('url-loader'),
              options: {
                limit: isEnvProduction ? 10000 : false,
                name: 'static/media/[name].[hash:5].[ext]',
              },
            },
            {
              loader: require.resolve('file-loader'),

              // 参考自: create-react-app/packages/react-scripts/config/webpack.config.js
              // 当以上 loader 都没能匹配，将执行 file-loader
              exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
              options: {
                name: 'static/media/[name].[hash:5].[ext]',
              },
            },
          ].filter(Boolean),
        },
      ],
    },
    plugins: [
      isEnvProduction
        && new CopyWebpackPlugin([{
          from: paths.appPublic,
          to: path.resolve(paths.appPath, outputDir),
          ignore: ['public/*.html'],
        }]),

      ...getHtmlWebpackPlugins(),
      new InterpolateHtmlPlugin(env.raw),

      // TODO: inline-manifest-webpack-plugin 暂时只支持 html-webpack-plugin 的 v3 版本，
      // 由于 html-webpack-plugin 的 beta 版本的兼容问题，暂时不启用该插件
      // isEnvProduction && new InlineManifestWebpackPlugin()

      new webpack.DefinePlugin(env.stringified),
      isEnvProduction
        && new MiniCssExtractPlugin({
          filename: `static/css/${outputFilename}.css`,
          chunkFilename: `static/css/${outputFilename}.chunk.css`,
        }),

      isEnvProduction && new CleanWebpackPlugin(),
    ].filter(Boolean),
    resolve: {
      modules: [paths.appSrc, 'node_modules'],
      extensions: ['.wasm', '.mjs', '.js', '.json', '.jsx'],
    },
    devtool: isEnvDevelopment
      ? 'eval'
      : sourceMap
        ? 'source-map'
        : false,
    devServer: {
      disableHostCheck: !devServer.proxy,
      compress: true,
      clientLogLevel: 'none',
      contentBase: paths.appPublic,
      watchContentBase: true,
      hot: true,
      host: '0.0.0.0',
      port: 3003,
      historyApiFallback: true,

      // 设置为预设值时，不会把命令行的 --color 参数合并进 stats 对象，导致命令行都是黑白的
      // 设置为 Object 后，webpack-dev-server 会合并 --color
      // webpack-dev-server 源码:
      // https://github.com/webpack/webpack-dev-server/blob/c9e9178a4882e414a6b9616baa35e8dbf7b2dd75/lib/utils/createConfig.js
      // minimal 预设配置:
      // https://github.com/webpack/webpack/blob/beec753201763fa3724bd965a93106126d13b271/lib/stats/DefaultStatsPresetPlugin.js
      stats: {
        all: false,
        modules: true,
        maxModules: 0,
        errors: true,
        warnings: true,
        logging: 'warn',
      },
      ...devServer,
    },
  };

  if (typeof configureWebpack === 'function') {
    return configureWebpack(webpackConfig, isEnvDevelopment ? 'development' : 'production');
  }

  return webpackMerge(webpackConfig, configureWebpack);
};
