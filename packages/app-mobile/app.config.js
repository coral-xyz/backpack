const projectID = "55bf074d-0473-4e61-9d9d-ecf570704635";
const packageName = "peterpme.coral.backpack";

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
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  updates: {
    fallbackToCacheTimeout: 0,
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
      backgroundColor: "#FFFFFF",
    },
    package: packageName,
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  extra: {
    url: process.env.WEBWORKER_URL,
    eas: {
      projectId: projectID,
    },
  },
};
