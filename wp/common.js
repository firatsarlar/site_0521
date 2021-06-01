const HtmlWebpackPlugin = require("html-webpack-plugin");
const { merge } = require('webpack-merge');
//const loadCSS = require("./css").loadCSS;
const webpack = require('webpack')
const path = require('path');

exports.commonConfig = merge([{

    entry: {
        main: ['./src/index.tsx']
    },
    // mode: 'development',
    optimization: {
        usedExports: true,
    },
    output: {
        filename: '[name].js',
        publicPath: '/'
    },
    resolve: {

        extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js",'.jsx'],

        // alias: {
        //     'react': 'preact/compat',
        //     'react-dom': 'preact/compat'
        // }
    },
    module: {

        rules: [{
            test: /\.tsx?$/,
            loader: "ts-loader",
        },
        // gr
        // {
        //     test: /\.(jpg|png)$/,
        //     use: {
        //         loader: "url-loader",
        //         options: {
        //             limit: 25000,
        //         },
        //     },
        // },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: "Webpack demo",
            template: './wp/index.ejs',
            // templateParameters: { portfolio: JSON.stringify(require(path.resolve(__dirname + "../../statics/portfolio.json"))) },
        })
        // , new RemoveLogs({ options: true })
    ],

    optimization: {
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "vendor",
                    chunks: "initial",
                },
            },
        },
    },
    /*
            optimization: {
                runtimeChunk: 'single',
                splitChunks: {
                 chunks: 'all',
                 maxInitialRequests: Infinity,
                 minSize: 0,
                 cacheGroups: {
                   vendor: {
                     test: /[\\/]node_modules[\\/]/,
                     name(module) {
                     // get the name. E.g. node_modules/packageName/not/this/part.js
                     // or node_modules/packageName
                     const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
             
                   // npm package names are URL-safe, but some servers don't like @ symbols
                   return `npm.${packageName.replace('@', '')}`;
                   },
                 },
               },
              },
             }
    */
    // externals: {
    //     //jquery: 'jQuery'
    //     preact: 'preact',
    //     preactRouter: 'preactRouter',
    //   },
},
    // loadCSS(),

]);