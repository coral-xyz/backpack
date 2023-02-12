// const { execSync } = require("child_process");
// function getLastCommitHash() {
//   if (process.env.EAS_BUILD_GIT_COMMIT_HASH) {
//     return process.env.EAS_BUILD_GIT_COMMIT_HASH.substring(0, 7);
//   }
//
//   if (process.env.COMMIT_HASH) {
//     return process.env.COMMIT_HASH.trim().substring(0, 7);
//   }
//
//   try {
//     const output = execSync("git rev-parse HEAD").toString();
//     return output.substring(0, 7);
//   } catch (_) {
//     return DEFAULT_HASH
//   }
// }

const projectID = "55bf074d-0473-4e61-9d9d-ecf570704635";
const packageName = "peterpme.coral.backpack";

export default {
  name: "Backpack",
  slug: "backpack",
  owner: "coral-xyz",
  version: "0.1.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "cover",
    backgroundColor: "#000",
  },
  updates: {
    fallbackToCacheTimeout: 0,
    url: "https://u.expo.dev/" + projectID,
  },
  runtimeVersion: {
    policy: "sdkVersion",
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: packageName,
    infoPlist: {
      WKAppBoundDomains: ["coral-xyz.github.io", "ngrok.io"],
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#000",
    },
    package: packageName,
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  extra: {
    localWebViewUrl: "http://localhost:9333",
    remoteWebViewUrl:
      "https://coral-xyz.github.io/backpack/background-scripts/85fa0c25/service-worker-loader.html",
    eas: {
      projectId: projectID,
    },
  },
};
