const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const workspaceRoot = path.resolve(__dirname, "../..");
const projectRoot = __dirname;

module.exports = async () => {
  const config = await getDefaultConfig(projectRoot);

  config.watchFolders = [workspaceRoot];

  config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, "node_modules"),
    path.resolve(workspaceRoot, "node_modules"),
  ];

  // config.resolver.extraNodeModules = {
  //   stream: path.resolve(workspaceRoot, "node_modules", "readable-stream"),
  //   // crypto: require.resolve("react-native-crypto-js"),
  // };

  config.transformer = {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  };

  config.resolver.sourceExts = [...config.resolver.sourceExts, "cjs", "svg"];

  return config;
};
