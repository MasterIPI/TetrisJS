const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.ts',
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
        use: [
          "style-loader",
          "css-loader",
          "sass-loader",
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    clean: true,
  },
  plugins: [
      new HtmlWebpackPlugin({
        template: './index.html',
        inject: false
      }),
      {
        apply(compiler) {
            compiler.hooks.shouldEmit.tap('RenderJsToHtmlPlugin', function (compilation) {
            let jsAssets = [];
            let htmlAsset;

            for (let asset of compilation.getAssets()) {
                if (asset.name.endsWith('.js')) {
                    jsAssets.push(asset);
                    continue;
                }

                if (asset.name.endsWith('.html')) {
                    htmlAsset = asset;
                    continue;
                }
            }

            for (let asset of jsAssets) {
                compilation.deleteAsset(asset.name);
            }

            let jsContent = jsAssets.map(content => content.source._value).join('');
            jsContent = '<script>' + jsContent + '</script></body>';

            let split = htmlAsset.source._value.split('</body>');

            htmlAsset.source._value = split.join(jsContent);
            return true;
            });
        }
      },
    ],
};