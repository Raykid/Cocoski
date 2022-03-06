/** @format */

const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// const ImageminPlugin = require("imagemin-webpack-plugin").default;
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const { Command } = require("commander");

const options = new Command()
  .option("-w", "webpack watch option.")
  .option("--config <config>", "webpack config path.")
  .option("--env <env>", "enveronment variables, splited with a comma(,).")
  .parse(process.argv)
  .opts();
const envs = options.env?.split(",") || [];
const isDev = envs.includes("development");
const needReport = envs.includes("report");

const SRC_PATH = path.resolve(__dirname, "../src");
const DIST_PATH = path.resolve(__dirname, "../dist");

const modeOpts = isDev
  ? {
      mode: "development",
      devtool: "source-map",
    }
  : {
      mode: "production",
    };

module.exports = [
  {
    ...modeOpts,

    entry: {
      injected: path.join(SRC_PATH, "/injected/index.ts"),
      content: path.join(SRC_PATH, "/content/index.ts"),
      background: path.join(SRC_PATH, "/background/index.ts"),
    },

    externals: ["cc"],

    output: {
      path: DIST_PATH,
      filename: "[name].js",
    },

    resolve: {
      extensions: [".ts", ".js", ".tsx", ".jsx"],
    },

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: "ts-loader",
              options: {
                compilerOptions: {
                  declaration: false,
                },
              },
            },
          ],
        },
      ],
    },

    plugins: [new CleanWebpackPlugin()],
  },
  {
    ...modeOpts,

    entry: {
      index: `${SRC_PATH}/devtool/index.tsx`,
    },

    output: {
      path: path.join(DIST_PATH, "devtool"),
      filename: "[name].[fullhash:10].js",
      chunkFilename: "bundle-[name].[chunkhash:10].js",
    },

    resolve: {
      extensions: [".ts", ".js", ".tsx", ".jsx"],
    },

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: "ts-loader",
              options: {
                compilerOptions: {
                  declaration: false,
                },
              },
            },
          ],
        },
        {
          test: /\.html?$/,
          loader: "html-loader",
        },
        {
          test: /\.(less|css)$/,
          sideEffects: true,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            // {
            //   loader: "style-loader",
            // },
            {
              loader: "css-loader",
            },
            {
              loader: "postcss-loader",
              options: {
                postcssOptions: {
                  ident: "postcss",
                  plugins: [require("autoprefixer")(), require("cssnano")()],
                },
              },
            },
          ],
        },
        {
          test: /\.less$/,
          use: [
            {
              loader: "less-loader",
              options: {
                lessOptions: {
                  javascriptEnabled: true,
                  modifyVars: {
                    "@root-entry-name": "dark",
                  },
                },
              },
            },
          ],
        },
        {
          test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
          loader: "url-loader",
        },
        {
          test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
          loader: "url-loader",
          options: {
            name: "static/[name]-[fullhash:10].[ext]",
            limit: 81920,
          },
        },
      ],
    },

    plugins: [
      new CleanWebpackPlugin(),
      new MiniCssExtractPlugin({
        filename: "[name].[fullhash:10].css",
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.join(SRC_PATH, "manifest.json"),
            to: DIST_PATH,
          },
          {
            from: path.join(SRC_PATH, "README.md"),
            to: DIST_PATH,
          },
          {
            from: path.join(SRC_PATH, "static"),
            to: path.join(DIST_PATH, "static"),
          },
        ],
      }),
      new HtmlWebpackPlugin({
        filename: "cocoski.html",
        template: "src/devtool/index.html",
        inject: true,
      }),
      // new ImageminPlugin({
      //   disable: isDev,
      //   pngquant: {
      //     quality: "80-90",
      //   },
      // }),
      ...(needReport
        ? [
            new BundleAnalyzerPlugin({
              analyzerMode: "static",
              openAnalyzer: false,
            }),
          ]
        : []),
    ],
  },
];
