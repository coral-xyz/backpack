const { execSync } = require("child_process");
const DEFAULT_HASH = "3603ba14";

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

const Config = {
  webviewUrl: "http://localhost:9333",
};

if (process.env.APP_ENV === "production") {
  // const commitHash = getLastCommitHash();
  Config.webviewUrl = `https://coral-xyz.github.io/backpack/background-scripts/${DEFAULT_HASH}/service-worker-loader.html`;
}

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
    webviewUrl: Config.webviewUrl,
    eas: {
      projectId: projectID,
    },
  },
};
