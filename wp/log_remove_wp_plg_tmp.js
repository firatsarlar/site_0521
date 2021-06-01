const fs = require("fs");
module.exports = class RemoveLogs {
    apply(compiler) {
        compiler.hooks.afterEmit.tap("RemoveLogs", (compilation) => {
            const { path, filename } = compilation.options.output;
            try {
                if (filename.endsWith(".js") || filename.endsWith(".tsx") || filename.endsWith(".ts")) {
                    console.log("plugg -> ", filename, path,);
                    let filePath = path + "/" + filename;
                    fs.readFile(filePath, "utf8", (err, data) => {
                        const rgx = /console.log\(['|"](.*?)['|"]\)/;
                        if (err) console.log(err);
                        if (data != "" && data != undefined) {
                            const newdata = data.replace(rgx, "");
                            fs.writeFile(filePath, newdata, function (err) {
                                if (err) {
                                    return console.log(err)
                                }
                                console.log("Logs Removed");
                            });
                        }
                    });
                }
            } catch (error) {
                console.log(error)
            }
        });
    }
};