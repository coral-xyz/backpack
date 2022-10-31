const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const workspaceRoot = path.resolve(__dirname, "../..");
const projectRoot = __dirname;

module.exports = () => {
  const config = getDefaultConfig(projectRoot);

  config.watchFolders = [workspaceRoot];

  config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, "node_modules"),
    path.resolve(workspaceRoot, "node_modules"),
  ];

  // Force Metro to resolve (sub)dependencies only from the `nodeModulesPaths`
  // config.resolver.disableHierarchicalLookup = true;

  config.transformer = {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  };

  // seems like backpack/node_modules/@solana/web3.js/node_modules/superstruct/lib/index.cjs needs this
  config.resolver.sourceExts = [...config.resolver.sourceExts, "cjs", "svg"];

  return config;
};
