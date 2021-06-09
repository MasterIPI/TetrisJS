const RenderRawStylesAndJsToHtmlPlugin = require('./plugin/render-raw-styles-and-js-to-html-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

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
            loader: 'file-loader',
            options: {
                name: '[name].css',
            }
          },
          {
              loader: 'extract-loader'
          },
          {
              loader: 'css-loader?-url'
          },
          {
              loader: 'postcss-loader'
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
      new HtmlWebpackPlugin({
        template: './index.html',
        inject: false
      }),
      new RenderRawStylesAndJsToHtmlPlugin({
        preventEmit: true,
        htmlNameToInject: 'index.html',
      })
    ],
};