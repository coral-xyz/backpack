const projectID = "55bf074d-0473-4e61-9d9d-ecf570704635";
const packageName = "peterpme.coral.backpack";

const localhostUrl = "http://localhost:9333";
const baseUrl = "https://coral-xyz.github.io/backpack/background-scripts/";
const commitHash = process.env.COMMIT_HASH;
const webWorkerUrl = `${baseUrl}/${commitHash}/service-worker-loader.html`;

const Config = {
  webWorkerUrl: localhostUrl,
};

if (process.env.APP_ENV === "production") {
  Config.webWorkerUrl = webWorkerUrl;
}

export default {
  name: "Backpack",
  slug: "backpack",
  owner: "coral-xyz",
  version: "0.1.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "dark",
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
    ...Config,
    eas: {
      projectId: projectID,
    },
  },
};
