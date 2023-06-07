import { ExpoConfig, ConfigContext } from "expo/config";

type ExpoExtras = {
  extra: {
    eas: {
      projectId: string;
    };
    serviceWorkerUrl: string;
    graphqlApiUrl: string;
  };
};

const localGraphQLApi = "http://localhost:8080/v2/graphql";
const remoteGraphQLApi = "https://backpack-api.xnfts.dev/v2/graphql";

// NOTE: this is the hardcoded hash for production builds via App Store
// deploy your current changes to production via pull request, switch to gh-pages branch and grab the hash from there
// then fire off a build
const PRODUCTION_SW_HASH = "8869656";

const getServiceWorkerUrl = () => {
  const url =
    "https://mobile-service-worker.xnfts.dev/background-scripts/latest/service-worker-loader.html";

  if (process.env.APP_ENV === "staging") {
    return url;
  }

  if (process.env.APP_ENV === "production") {
    return url.replace(/latest/g, PRODUCTION_SW_HASH);
  } else {
    return "http://localhost:9333";
  }
};

export default ({ config }: ConfigContext): ExpoConfig & ExpoExtras => {
  const projectID = "55bf074d-0473-4e61-9d9d-ecf570704635";
  const packageName = "app.backpack.mobile";

  const serviceWorkerUrl = getServiceWorkerUrl();
  const graphqlApiUrl =
    process.env.APP_ENV === "production" || process.env.APP_ENV === "staging"
      ? remoteGraphQLApi
      : localGraphQLApi;

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
    plugins: [
      [
        "expo-build-properties",
        {
          android: {
            unstable_networkInspector: true,
          },
          ios: {
            unstable_networkInspector: true,
          },
        },
      ],
    ],
    updates: {
      fallbackToCacheTimeout: 0,
      url: "https://u.expo.dev/" + projectID,
    },
    runtimeVersion: {
      policy: "sdkVersion",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      config: {
        usesNonExemptEncryption: false,
      },
      supportsTablet: false,
      bundleIdentifier: packageName,
      // bundleIdentifier: IS_DEV ? 'com.myapp.dev' : 'com.myapp',
      infoPlist: {
        // ATTENTION: Your service worker must live in the top 3 or will not load
        // Apple considers this a feature
        // https://bugs.webkit.org/show_bug.cgi?id=227531
        WKAppBoundDomains: [
          "mobile-service-worker.xnfts.dev",
          "mobile-service-worker.netlify.app",
          // "xnfts.dev", // uncomment for testing
          // "netlify.app",
          // "ngrok.io",
        ],
      },
    },
    android: {
      package: packageName,
      // package: IS_DEV ? 'com.myapp.dev' : 'com.myapp',
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
      graphqlApiUrl,
      serviceWorkerUrl,
      eas: {
        projectId: projectID,
      },
    },
  };
};
