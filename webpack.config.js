const { merge } = require('webpack-merge');
const commonConfig = require("./wp/common").commonConfig;
const CSS = require("./wp/css");
let productionConfig = require("./wp/prod").productionConfig;
let developmentConfig = require("./wp/dev");


developmentConfig = merge([
    developmentConfig.devServer({
        // Customize host/port here if needed
        host: process.env.HOST,
        port: process.env.PORT,
    }),
    CSS.loadCSS(),
    // CSS.extractCSS(),
    
 
]);

module.exports = _mode => {
    let mode = _mode.development ? "development" : "production";

    console.log("mode -> ", mode, "\n");
    if (mode === "production") {
        process.env["NODE_ENV"] = "production"
        console.log("wp nevn",process.env["NODE_ENV"]);
        
        let ret = merge(commonConfig,CSS.extractCSS(), productionConfig(), { mode })
        console.log(ret);
        return ret;
    }
    let ret =  merge(commonConfig, developmentConfig, {mode });
    console.log(ret);
    return ret;
};