const createExpoWebpackConfigAsync = require("@expo/webpack-config");

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  if (config.mode === "development") {
    config.devServer.compress = false;

    config.devServer.writeToDisk = true;
  }

  return config;
};
