const path = require('path')
const ChromeReloadPlugin = require('wcer')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const eslintFriendlyFormatter = require('eslint-friendly-formatter')
const constants = require('./config/constants')
const svgConfig = require('./config/svg.config')
const postcssConfig = require('./config/postcss.config')

module.exports = {
  entry: constants.ENTRY_PATH,

  output: {
    path: constants.DIST_PATH,
    publicPath: constants.PUBLIC_PATH,
    filename: 'js/[name].js',
    chunkFilename: 'js/[id].[name].js?[hash]',
    library: '[name]',
  },

  resolve: {
    extensions: ['.js', '.vue', '.jsx', '.json'],
    alias: {
      '@': constants.SRC_PATH,
    },
  },

  module: {
    rules: [{
      enforce: 'pre',
      test: /\.(js|vue)$/,
      loader: 'eslint-loader',
      include: [constants.SRC_PATH],
      options: {
        formatter: eslintFriendlyFormatter,
      },
    }, {
      enforce: 'pre',
      test: /\.svg$/,
      loader: `svgo-loader?${JSON.stringify(svgConfig)}`,
    }, {
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
    }, {
      test: /\.css$/,
      use: ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: [{
          loader: 'css-loader',
          options: {
            minimize: true,
          },
        }, {
          loader: 'postcss-loader',
          options: {
            plugins: () => postcssConfig.plugins,
          },
        }],
      }),
    }, {
      test: /\.vue$/,
      loader: 'vue-loader',
      options: {
        extractCSS: true,
        autoprefixer: false,
        minimize: true,
        cssModules: {
          localIdentName: '[name]-[hash:base64:5]',
          camelCase: true,
        },
        loaders: {
          js: 'babel-loader',
        },
        postcss: postcssConfig.plugins,
        preserveWhitespace: false,
      },
    }, {
      test: /\.json$/,
      loader: 'json-loader',
    }, {
      test: /\.html$/,
      loader: 'vue-html-loader?minimize=false',
    }, {
      test: /\.svg$/,
      exclude: [/not-sprite-svg/],
      loader: 'svg-sprite-loader',
    }, {
      test: /\.svg$/,
      include: [/not-sprite-svg/],
      loader: 'url-loader',
      query: {
        limit: constants.URL_LOADER_LIMIT,
        name: path.posix.join(constants.ASSETS_PATH, '[name].[hash:7].[ext]'),
      },
    }, {
      test: /\.(gif|png|jpe?g)(\?\S*)?$/,
      loader: 'url-loader',
      query: {
        limit: constants.URL_LOADER_LIMIT,
        name: path.posix.join(constants.ASSETS_PATH, '[name].[hash:7].[ext]'),
      },
    }]
  },

  plugins: [
    // for popup page
    new HtmlWebpackPlugin({
      filename: 'popup.html',
      template: path.join(constants.SRC_PATH, 'popup.html'),
      hash: true,
      cache: true,
    }),
    new ExtractTextPlugin({
      filename: 'css/style.css',
    }),
    new CopyWebpackPlugin([{
      from: constants.ASSETS_PATH,
    }]),
    new ChromeReloadPlugin({
      port: 9090,
      manifest: constants.MANIFEST_FILE,
    }),
  ],

  performance: {
    hints: false
  },
}
