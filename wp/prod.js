const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const path = require("path");

exports.productionConfig = () => {
    return {
        optimization: {

            minimize: true,
            minimizer: [new TerserPlugin()],
        },
        plugins: [
            new CopyPlugin({
                patterns: [
                    {
                        from: 'statics',
                        globOptions: {
                            ignore: ["*/**/__/**"]
                        }
                    }
                ],
            }),
          

        ],
    }
};