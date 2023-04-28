import { ExpoConfig, ConfigContext } from "expo/config";

type ExpoExtras = {
  extra: {
    FEATURE_MOBILE_CHAT: boolean;
    localWebViewUrl: string;
    remoteWebViewUrl: string;
    graphqlApiUrl: string;
  };
};

const localGraphQLApi = "http://localhost:8080/v2/graphql";
const remoteGraphQLApi = "https://backpack-api.xnfts.dev/v2/graphql";

export default ({ config }: ConfigContext): ExpoConfig & ExpoExtras => {
  const projectID = "55bf074d-0473-4e61-9d9d-ecf570704635";
  const packageName = "app.backpack.mobile";

  const getUrl = (hash: string = "8b0f1ba") =>
    `https://mobile-service-worker.xnfts.dev/background-scripts/${hash}/service-worker-loader.html`;

  const remoteWebViewUrl = getUrl();

  return {
    ...config,
    name: "Backpack",
    slug: "backpack",
    owner: "coral-xyz",
    version: "0.1.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
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
      supportsTablet: false,
      bundleIdentifier: packageName,
      infoPlist: {
        NSAllowsArbitraryLoads: true,
        NSExceptionDomains: {
          localhost: {
            NSExceptionAllowsInsecureHTTPLoads: true,
            NSIncludesSubdomains: true,
          },
        },
        WKAppBoundDomains: [
          "coral-xyz.github.io",
          "ngrok.io",
          "backpack-api.xnfts.dev",
          "mobile-service-worker.xnfts.dev",
        ],
      },
    },
    android: {
      package: packageName,
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON,
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#000",
      },
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    extra: {
      FEATURE_MOBILE_CHAT: true,
      graphqlApiUrl: localGraphQLApi,
      localWebViewUrl: "http://localhost:9333",
      remoteWebViewUrl,
      eas: {
        projectId: projectID,
      },
    },
  };
};
