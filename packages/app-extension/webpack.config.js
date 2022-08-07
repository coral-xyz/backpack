const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const { ProgressPlugin, ProvidePlugin } = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");

const EXTENSION_NAME =
  process.env.NODE_ENV === "development" ? "(DEV) Backpack" : "Backpack";

const EXTENSION_KEY =
  process.env.NODE_ENV === "development"
    ? // dev: chrome://extensions/?id=ppbliddanlojgfoeknmmdniicoccellh
      "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0lFAxMWLjYDYpWhWI5DtjXwdNhFsHynebSN2K1sMOUl1F+8s9fUTKShmjMqwRdvb/+pUd9qIUdEUYRf2Y7eF3Be117uL5IvNI61YzWWUCU6r/OtgENpug38ssaPSXFwXVDT7wLq8Y/7w2So9mxlzgsCvJQX3wpziCEzhRExWjJBpfjxXeUSEjzoUAe6OEXQ0R4pRfxBVF5lGZEyQdLUWHKch4rHJrzOS6FqzExuOWC/6YKEwskpieP5OUA3pLKujB4AfAlEAcDndwKYGncBYnOCeki2krw61Grb4oJbTfBIbMUImFaMrkREaSGg531WmsxIMy/QIz8JDR235m9gLsQIDAQAB"
    : // prod: chrome://extensions/?id=onehipemlbcjfecgbeimidpecoofepan
      "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0F6bwLJ+5sLGbMPT+ssluU30hh0jL9v0z0tu97pv3qCs0R/lxPL8P/CM4/x/6WoHnUuN0MVP8nfaVGheSa03O6h11SfLXDgJEti7OErAXtP4nlX+sg9DxKdHjGl1vsMO4WOvNvaL2surdT0KTp5HK/xd62cISYgKL9C7AZJtKZYsBTCflSG4YDcpvTC2IbFMhRmG2uh/hiVGuRjb+3Ld7YV+Vss+ng0Ow6HE7MLDyuWIJu8L/n6/DbcaU7HuesqnMI+UdaSdOh1cjYazCQPMFTxXn6Uz/iPgwv8i4lKANR5sOg0eyWQkUAxzlE+UMK0VHaqYoMrPI644+a9gL6BdOQIDAQAB";

const fileExtensions = [
  "eot",
  "gif",
  "jpeg",
  "jpg",
  "otf",
  "png",
  "svg",
  "ttf",
  "woff",
  "woff2",
];

const {
  dir,
  plugins = [],
  ...extras
} = process.env.NODE_ENV === "development"
  ? {
      dir: "dev",
      devServer: {
        // watchFiles: ['src/**/*', 'webpack.config.js'],
        compress: false,
        static: {
          directory: path.join(__dirname, "../dev"),
        },
        client: {
          // logging: "info",
          progress: true,
          reconnect: false,
          overlay: {
            errors: true,
            warnings: false,
          },
        },
        devMiddleware: {
          writeToDisk: true,
        },
      },
      devtool: "cheap-module-source-map",
      plugins: [
        new ForkTsCheckerWebpackPlugin(),
        new ReactRefreshWebpackPlugin(),
      ],
    }
  : {
      dir: "build",
      plugins: [
        // new BundleAnalyzerPlugin(),
      ],
    };

const options = {
  mode: process.env.NODE_ENV,
  entry: {
    background: "./src/background/index.ts",
    options: "./src/options/index.tsx",
    popup: "./src/index.tsx",
    contentScript: "./src/contentScript/index.ts",
    // injected: "../provider-injection/dist/browser/index.js",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, dir),
    clean: true,
    publicPath: "",
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false, // disable the behaviour
        },
      },
      {
        test: /\.css$/,
        use: [
          {
            loader:
              process.env.NODE_ENV === "production"
                ? MiniCssExtractPlugin.loader
                : "style-loader",
          },
          {
            loader: "css-loader",
          },
        ],
      },
      {
        type: "javascript/auto",
        test: /\.json$/,
        use: ["file-loader"],
        include: /tokenlist/,
      },
      {
        test: new RegExp(".(" + fileExtensions.join("|") + ")$"),
        type: "asset/resource",
        exclude: /node_modules/,
        loader: "file-loader",
        options: {
          name: "assets/[name].[ext]",
        },
      },
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: require.resolve("swc-loader"),
          options: {
            sourceMap: process.env.NODE_ENV === "development",
            jsc: {
              target: "es2021",
              parser: {
                syntax: "typescript",
                tsx: true,
                dynamicImport: true,
              },
              transform: {
                react: {
                  development: process.env.NODE_ENV === "development",
                  refresh: process.env.NODE_ENV === "development",
                },
              },
            },
          },
        },
      },
    ],
  },
  resolve: {
    extensions: fileExtensions
      .map((extension) => "." + extension)
      .concat([".js", ".jsx", ".ts", ".tsx", ".css"]),
    fallback: {
      buffer: require.resolve("buffer/"), // trailing slash is intentional
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
    },
  },
  plugins: [
    new CleanWebpackPlugin(),
    ...plugins,
    new MiniCssExtractPlugin(),
    new ProgressPlugin(),
    new ProvidePlugin({
      process: "process/browser",
      React: "react",
      Buffer: ["buffer", "Buffer"],
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "src/manifest.json",
          force: true,
          transform: function (content, path) {
            return Buffer.from(
              JSON.stringify(
                {
                  description: process.env.npm_package_description,
                  version:
                    process.env.VERSION_NUMBER ||
                    process.env.npm_package_version,
                  name: EXTENSION_NAME,
                  key: EXTENSION_KEY,
                  ...JSON.parse(content.toString()),
                },
                null,
                2
              )
            );
          },
        },
        {
          from: "src/*.{html,png,svg}",
          to: "[name][ext]",
          force: true,
        },
        {
          // use a different icon depending on the NODE_ENV
          from: `src/anchor-${process.env.NODE_ENV}.png`,
          to: "anchor.png",
          force: true,
        },
        {
          from: `src/assets/`,
          to: "assets/",
          force: true,
        },
        {
          from: "../provider-injection/dist/browser/index.js",
          to: "injected.js",
          force: true,
        },
      ],
    }),
  ],
  ...extras,
};

module.exports = options;
