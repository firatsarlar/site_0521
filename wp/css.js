const MiniCssExtractPlugin = require("mini-css-extract-plugin");

exports.extractCSS = (/*{ include, exclude, use = [] }*/) => {
  // Output extracted CSS to a file
  const plugin = new MiniCssExtractPlugin({
    filename: "styles/[name].css",
    attributes:{
      "media":"all"
    }
  });

  return {
    module: {
      rules: [
        {
          test: /\.css$/,
          // include,
          // exclude,

          use: [
            MiniCssExtractPlugin.loader,
            "css-loader"
          ],
        },
        {
          test: /\.scss$/,

          use: [MiniCssExtractPlugin.loader, "css-loader",
          {
            loader: 'resolve-url-loader',
            // options: {...}
          },
          {
            loader: "sass-loader",
            options: {
              
            }
          }

          ],
          //     use: ["style-loader", "css-loader", "sass-loader"],
        },
      ],
    },
    plugins: [plugin],
  };
};
exports.loadCSS = ({ include, exclude } = {}) => {
  // const plugin = new MiniCssExtractPlugin({
  //   filename: "styles/[name].css",
  // });
  return {
    module: {
      rules: [
        {
          test: /\.css$/,
          include,
          exclude,

          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.scss$/,

          //    use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],,'preprocess-loader'
          use: ["style-loader", "css-loader",
            // {
            //   loader: 'resolve-url-loader',
            //   // options: {...}
            // },
            {
              loader: "sass-loader",
              options: {
                sassOptions: {
                }
              }

            },
          ],
        },
        //plugins: [plugin],
      ]
    }
  }
};