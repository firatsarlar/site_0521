
const path = require("path");
const webpack = require('webpack')
var express = require('express');
const RemoveLogs = require('./log_remove_wp_plg_tmp.js');

// var webpackConfig = require('../webpack.config');

// var compiler = webpack(webpackConfig);

exports.devServer = ({ host, port } = {}) => ({
  entry: {
    main: [
      // 'webpack-hot-middleware/client',
      path.resolve(__dirname, '../src/index.tsx')
    ],
    // hmr: `webpack-dev-server/client?http://localhost:${8080}`
  },
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
    contentBase: path.resolve(__dirname, "../statics"),
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
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('development')
      }
    }),
   

  ],

  devtool: 'inline-source-map',
});
