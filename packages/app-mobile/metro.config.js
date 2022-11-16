// Learn more https://docs.expo.dev/guides/monorepos
const { getDefaultConfig } = require("expo/metro-config");
const { FileStore } = require("metro-cache");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// If your monorepo tooling can give you the list of monorepo workspaces linked
// in your app workspace, you can automate this list instead of hardcoding them.
const monorepoPackages = {
  "@coral-xyz/common": path.resolve(workspaceRoot, "packages/common"),
  "@coral-xyz/recoil": path.resolve(workspaceRoot, "packages/recoil"),
};

// 1. Watch the local app folder, and all related packages (limiting the scope and speeding it up)
config.watchFolders = [__dirname, ...Object.values(monorepoPackages)];

config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

// seems like backpack/node_modules/@solana/web3.js/node_modules/superstruct/lib/index.cjs needs this
config.resolver.sourceExts = [...config.resolver.sourceExts, "cjs", "svg"];

// Use turborepo to restore the cache when possible
config.cacheStores = [
  new FileStore({
    root: path.join(projectRoot, "node_modules", ".cache", "metro"),
  }),
];

// Add the monorepo workspaces as `extraNodeModules` to Metro.
// If your monorepo tooling creates workspace symlinks in the `node_modules` folder,
// you can either add symlink support to Metro or set the `extraNodeModules` to avoid the symlinks.
// See: https://facebook.github.io/metro/docs/configuration/#extranodemodules
config.resolver.extraNodeModules = monorepoPackages;

// Try resolving with project modules first, then workspace modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// Force Metro to resolve (sub)dependencies only from the `nodeModulesPaths`
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
