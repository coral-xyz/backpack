"use strict";

const path = require("path");
const fs = require("fs");

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebook/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

const moduleFileExtensions = [
  "web.mjs",
  "mjs",
  "web.js",
  "js",
  "web.ts",
  "ts",
  "web.tsx",
  "tsx",
  "json",
  "web.jsx",
  "jsx",
];

// Resolve file paths in the same order as webpack
const resolveModule = (resolveFn, filePath) => {
  const extension = moduleFileExtensions.find((extension) =>
    fs.existsSync(resolveFn(`${filePath}.${extension}`))
  );

  if (extension) {
    return resolveFn(`${filePath}.${extension}`);
  }

  return resolveFn(`${filePath}.js`);
};

// config after eject: we're in ./config/
module.exports = {
  dotenv: resolveApp(".env"),
  appPath: resolveApp("."),
  appBuild: resolveApp("build"),
  devAppBuild: resolveApp("dev"),
  appPublic: resolveApp("public"),
  manifestJson: resolveApp("public/manifest.json"),
  appOptionsHtml: resolveApp("public/options.html"),
  appPopupHtml: resolveApp("public/popup.html"),
  appIndexJs: resolveModule(resolveApp, "src/index"),
  appBackgroundJs: resolveModule(resolveApp, "src/background/index"),
  appContentScriptJs: resolveModule(resolveApp, "src/contentScript/index"),
  appOptionsJs: resolveModule(resolveApp, "src/options/index"),
  appPackageJson: resolveApp("package.json"),
  appSrc: resolveApp("src"),
  appTsConfig: resolveApp("tsconfig.json"),
  appJsConfig: resolveApp("jsconfig.json"),
  yarnLockFile: resolveApp("yarn.lock"),
  testsSetup: resolveModule(resolveApp, "src/setupTests"),
  appNodeModules: resolveApp("node_modules"),
};

module.exports.moduleFileExtensions = moduleFileExtensions;
