const RenderRawStylesAndJsToHtmlPlugin = require('./plugin/render-raw-styles-and-js-to-html-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: ['./src/index.ts', './styles/main.scss'],
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.s[ac]ss$/i,
        exclude: /node_modules/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          {
            loader: 'css-loader'
          },
          {
            loader: 'sass-loader'
          }
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    clean: true,
    publicPath: '',
  },
  plugins: [
      new MiniCssExtractPlugin(),
      new HtmlWebpackPlugin({
        template: './index.html',
        inject: false,
        minify: {
          collapseWhitespace: true,
          keepClosingSlash: true,
          removeComments: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
          useShortDoctype: true,
          removeAttributeQuotes: true,
          removeRedundantAttributes: true,
        },
      }),
      new RenderRawStylesAndJsToHtmlPlugin({
        preventEmit: true,
        htmlNameToInject: 'index.html',
      })
    ],
};