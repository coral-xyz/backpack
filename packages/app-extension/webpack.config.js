const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const { DuplicatesPlugin } = require("inspectpack/plugin");
const { ProgressPlugin, ProvidePlugin } = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");

const EXTENSION_NAME =
  process.env.NODE_ENV === "development" ? "(DEV) Backpack" : "Backpack";

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
            loader: "style-loader",
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
                  version: process.env.npm_package_version,
                  name: EXTENSION_NAME,
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
