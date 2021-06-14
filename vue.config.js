const { IgnorePlugin } = require('webpack');
module.exports = {
    devServer: {
        disableHostCheck: true,
    },

    configureWebpack: {
        plugins: [new IgnorePlugin(/^\.\/locale$/, /moment$/)],
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
};
