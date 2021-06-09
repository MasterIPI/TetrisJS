module.exports = function RenderRawStylesAndJsToHtmlPlugin(options) {
    this.pluginName = this.constructor.name;

    this.options = { 
        preventEmit : true,
        htmlNameToInject: 'index.html',
        _validHtmlSplitParts: 2,
    };

    Object.assign(this.options, options);

    this.apply = (compiler) => {
        compiler.options.RenderRawStylesAndJsToHtmlPlugin = this.options;

        compiler.hooks.shouldEmit.tap(this.pluginName, function (compilation) {
            let options = compilation.options.RenderRawStylesAndJsToHtmlPlugin;
            let jsAssets = [];
            let cssAssets = [];
            let htmlAsset;

            for (let asset of compilation.getAssets()) {
                let assetFound = asset.name.endsWith('.js');

                if (assetFound) {
                    jsAssets.push(asset);
                }

                if (!assetFound && asset.name.endsWith('.css')) {
                    cssAssets.push(asset);
                    assetFound = true;
                }

                if (assetFound && options.preventEmit) {
                    compilation.deleteAsset(asset.name);
                }

                if (!assetFound && asset.name === options.htmlNameToInject) {
                    htmlAsset = asset;
                }
            }

            let isSeparateCssPresent = cssAssets.length > 0;

            options._validHtmlSplitParts += isSeparateCssPresent ? 1 : 0;

            let htmlSplitter = isSeparateCssPresent ? /(?:<\/head>)|(?:<\/body>)/gi : '</body>';

            let htmlContent = htmlAsset.source._value.split(htmlSplitter);

            if (htmlContent.length !== options._validHtmlSplitParts) {
                throw new Error('html content is not valid.');
            }

            let cssContent = '';
            if (isSeparateCssPresent) {
                cssContent = `<style>${cssAssets.map(asset => asset.source._value).join('')}</style></head>`;
                cssAssets = null;
                htmlContent.splice(1, 0, cssContent);
            }

            let jsContent = `<script>${jsAssets.map(asset => asset.source._value).join('')}</script></body>`;
            jsAssets = null;
            htmlContent.splice(htmlContent.length - 1, 0, jsContent);

            htmlAsset.source._value = htmlContent.join('');
            return true;
        });
    }
}