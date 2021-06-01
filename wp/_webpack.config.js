const { mode } = require("webpack-nano/argv");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const path = require("path");
var express = require('express');

// 2. create a transformer;
// the factory additionally accepts an options object which described below

module.exports = {
  watch: mode === "development",
  entry: ["./src/index.tsx"],
  devtool: 'inline-source-map',
  devServer: {
    watchOptions: {
      // Delay the rebuild after the first change
      aggregateTimeout: 300,

      // Poll using interval (in ms, accepts boolean too)
      //poll: 1000,
    },
    // Display only errors to reduce the amount of output.
    stats: "errors-only",

    // Parse host and port from env to allow customization.
    //
    // If you use Docker, Vagrant or Cloud9, set
    // host: options.host || "0.0.0.0";
    //
    // 0.0.0.0 is available to all network devices
    // unlike default `localhost`.
    host: "0.0.0.0", //process.env.HOST, // Defaults to `localhost`
    port: process.env.PORT, // Defaults to 8080
    open: false, // Open the page in browser
    overlay: true,
    // hot: true,
    hotOnly: true,
    publicPath: '/',
    // contentBase: path.resolve(__dirname, "../statics"),
    historyApiFallback: true,
    // historyApiFallback: {
    //   index: '/dist/index.html'
    // },
    proxy: {
      // '/images/gallery/**': {
      //   target: 'http://192.168.1.23/',
      //   secure: false
      // },
      '/portfolio/**': {
        target: 'http://localhost:3000',
        secure: false
      }
    },
    compress: true,
    before(app) {
      //     //app.use(require('webpack-hot-middleware')(compiler))
      app.use('/', express.static('/statics'));
      // app.use(
      //     require("webpack-dev-middleware")(compiler, {
      //     noInfo: true, publicPath: "./"
      // }));
    }
  },

  module: {

    rules: [{
      test: /\.tsx?$/,
      loader: "ts-loader",
      options: {

      }
    },
      // {
      //   enforce: "pre",
      //   test: /\.js$/,
      //   loader: "source-map-loader",
      // },


      // {
      //   test: /\.js$/,
      //   loader: 'preprocess-loader',
      // },
      // {
      //   test: /\.(jpg|png)$/,
      //   use: {
      //     loader: "url-loader",
      //     options: {
      //       limit: 25000,
      //     },
      //   },
      // },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    // alias: {
    //   'react': 'preact/compat',
    //   'react-dom/test-utils': 'preact/test-utils',
    //   'react-dom': 'preact/compat'
    // }
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Webpack demo",
      template: './index.ejs',
      // templateParameters: { portfolio: JSON.stringify(require(path.resolve(__dirname + "../../statics/portfolio.json"))) },
    }),



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
};
/*
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

  extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"],

    alias: {
    react: 'preact-compat',
      'react-dom': 'preact-compat'
  }
},
*/