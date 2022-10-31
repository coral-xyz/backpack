// Learn more https://docs.expo.dev/guides/monorepos
const { getDefaultConfig } = require("expo/metro-config");
const { FileStore } = require("metro-cache");
const path = require("path");

// Find the project and workspace directories
const projectRoot = __dirname;

// This can be replaced with `find-yarn-workspace-root`
const workspaceRoot = path.resolve(projectRoot, "../..");
const config = getDefaultConfig(projectRoot);

const monorepoPackages = {
  "@coral-xyz/common": path.resolve(workspaceRoot, "packages/common"),
  "@coral-xyz/common-public": path.resolve(
    workspaceRoot,
    "packages/common-public"
  ),
  "@coral-xyz/recoil": path.resolve(workspaceRoot, "packages/recoil"),
  "@coral-xyz/background": path.resolve(workspaceRoot, "packages/background"),
};

// 1. Watch all files within the monorepo
config.watchFolders = [__dirname, ...Object.values(monorepoPackages)];
config.resolver.extraNodeModules = monorepoPackages;

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// 3. Force Metro to resolve (sub)dependencies only from the `nodeModulesPaths`
config.resolver.disableHierarchicalLookup = true;

// config.transformer = {
//   getTransformOptions: async () => ({
//     transform: {
//       experimentalImportSupport: false,
//       inlineRequires: true,
//     },
//   }),
// };

config.resolver.sourceExts = [...config.resolver.sourceExts, "cjs", "svg"];

// Use turborepo to restore the cache when possible
// config.cacheStores = [
//   new FileStore({
//     root: path.join(projectRoot, "node_modules", ".cache", "metro"),
//   }),
// ];

module.exports = config;
