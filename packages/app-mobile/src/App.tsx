import { Suspense, useCallback, useRef } from "react";
import { StyleSheet, Text, View, Platform } from "react-native";

import Constants from "expo-constants";
import * as Device from "expo-device";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";

import {
  BACKGROUND_SERVICE_WORKER_READY,
  useStore,
  WEB_VIEW_EVENTS,
} from "@coral-xyz/common";
import { ErrorBoundary } from "react-error-boundary";
import { WebView } from "react-native-webview";
import { RecoilRoot } from "recoil";

import { useTheme } from "~hooks/useTheme";
import { maybeParseLog } from "~lib/helpers";

import { Providers } from "./Providers";
import { FullScreenLoading } from "./components";
import { useLoadedAssets } from "./hooks/useLoadedAssets";
import { RootNavigation } from "./navigation/RootNavigator";

SplashScreen.preventAutoHideAsync();

export function App(): JSX.Element {
  const renderError = useCallback(
    ({ error }: { error: { message: string } }) => (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>{error.message}</Text>
      </View>
    ),
    []
  );

  return (
    <ErrorBoundary fallbackRender={renderError}>
      <Suspense fallback={<FullScreenLoading />}>
        <RecoilRoot>
          <BackgroundHiddenWebView />
          <Main />
        </RecoilRoot>
      </Suspense>
    </ErrorBoundary>
  );
}

function ServiceWorkerErrorScreen({ onLayoutRootView }: any): JSX.Element {
  return (
    <View
      onLayout={onLayoutRootView}
      style={{
        backgroundColor: "#8b0000",
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text>The service worker failed to load.</Text>
      <Text>
        {JSON.stringify(
          { uri: Constants?.expoConfig?.extra?.webviewUrl },
          null,
          2
        )}
      </Text>
    </View>
  );
}

function Main(): JSX.Element | null {
  const theme = useTheme();
  const appLoadingStatus = useLoadedAssets();

  const onLayoutRootView = useCallback(async () => {
    // If the service worker isn't running, show an error screen.
    if (appLoadingStatus === "error" || appLoadingStatus === "ready") {
      // This tells the splash screen to hide immediately! If we call this after
      // `setAppIsReady`, then we may see a blank screen while the app is
      // loading its initial state and rendering its first pixels. So instead,
      // we hide the splash screen once we know the root view has already
      // performed layout!
      await SplashScreen.hideAsync();
    }
  }, [appLoadingStatus]);

  if (appLoadingStatus === "error") {
    return <ServiceWorkerErrorScreen onLayoutRootView={onLayoutRootView} />;
  }

  if (appLoadingStatus === "loading") {
    return null;
  }

  return (
    <Providers>
      <View
        onLayout={onLayoutRootView}
        style={[
          styles.container,
          {
            backgroundColor: theme.custom.colors.background,
          },
        ]}
      >
        <StatusBar />
        <RootNavigation colorScheme={theme.colorScheme as "dark" | "light"} />
      </View>
    </Providers>
  );
}

const getWebviewUrl = () => {
  const { localWebViewUrl, remoteWebViewUrl } =
    Constants.expoConfig?.extra || {};

  if (process.env.NODE_ENV === "development" && Platform.OS === "android") {
    return remoteWebViewUrl;
  }

  return Device.isDevice ? remoteWebViewUrl : localWebViewUrl;
};

function BackgroundHiddenWebView(): JSX.Element {
  const setInjectJavaScript = useStore(
    (state: any) => state.setInjectJavaScript
  );
  const ref = useRef(null);
  const webviewUrl = getWebviewUrl();

  return (
    <View style={styles.webview}>
      <WebView
        ref={ref}
        // cacheMode="LOAD_CACHE_ELSE_NETWORK"
        // cacheEnabled
        limitsNavigationsToAppBoundDomains
        source={{ uri: webviewUrl }}
        onError={(error) => console.log("WebView error:", error)}
        onHttpError={(error) => console.log("WebView HTTP error:", error)}
        onMessage={(event) => {
          const msg = JSON.parse(event.nativeEvent.data);
          maybeParseLog(msg);
          if (msg.type === BACKGROUND_SERVICE_WORKER_READY) {
            // @ts-expect-error
            setInjectJavaScript(ref.current?.injectJavaScript);
          } else {
            WEB_VIEW_EVENTS.emit("message", msg);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    display: "none",
  },
});
