const { IgnorePlugin } = require('webpack');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
module.exports = {
    devServer: {
        disableHostCheck: true,
    },
    publicPath: '/',
    configureWebpack: {
        plugins: [
            new IgnorePlugin(/^\.\/locale$/, /moment$/),
            new MonacoWebpackPlugin({
                languages: ['json', 'javascript', 'typescript', 'html', 'css', 'markdown', 'csharp', 'java'],
            }),
        ],
        optimization: {
            splitChunks: {
                chunks: 'initial',
                minSize: 1000,
                maxSize: 0,
                cacheGroups: {
                    moment: {
                        test: /[\\/]node_modules[\\/]moment[\\/]/,
                        name: 'vendor.moment',
                        enforce: true,
                        priority: 20,
                    },
                    vendors: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        priority: 10,
                        enforce: true, // create chunk regardless of the size of the chunk
                        //maxSize: 10000
                    },
                },
            },
        },
        devtool: 'source-map',
    },
    chainWebpack: config => {
        config.resolve.alias.set(
            'vscode',
            path.resolve('./node_modules/monaco-languageclient/lib/vscode-compatibility')
        );
    },
};
