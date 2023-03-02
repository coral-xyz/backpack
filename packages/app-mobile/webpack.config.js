const createExpoWebpackConfigAsync = require("@expo/webpack-config");
const path = require("path");
const { ProvidePlugin } = require("webpack");

const _dirname = __dirname; // eslint-disable-line

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  config.resolve.alias = {
    ...config.resolve.alias,
    "~components": path.resolve(_dirname, "src/components"),
    "~hooks": path.resolve(_dirname, "src/hooks"),
    "~themes": path.resolve(_dirname, "src/themes"),
    "~navigation": path.resolve(_dirname, "src/navigation"),
    "~lib": path.resolve(_dirname, "src/lib"),
    "~screens": path.resolve(_dirname, "src/screens"),
    "@@types": path.resolve(_dirname, "src/types"),
    "expo-modules-core": path.resolve(
      _dirname,
      "node_modules/expo-modules-core"
    ),
  };

  config.resolve.fallback = {
    ...config.resolve.fallback,
    buffer: require.resolve("buffer/"), // trailing slash is intentional
  };

  config.plugins = [
    ...config.plugins,
    new ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
    }),
  ];

  return config;
};
