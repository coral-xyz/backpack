import { Suspense, useCallback, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";

import Constants from "expo-constants";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import * as Updates from "expo-updates";

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
      <BackgroundHiddenWebView />
      <Suspense fallback={<FullScreenLoading />}>
        <RecoilRoot>
          <Main />
        </RecoilRoot>
      </Suspense>
    </ErrorBoundary>
  );
}

function Main(): JSX.Element | null {
  const theme = useTheme();
  const appLoadingStatus = useLoadedAssets();
  const webviewLoaded = useStore((state) => state.injectJavaScript);

  const onLayoutRootView = useCallback(async () => {
    if (appLoadingStatus === "ready") {
      await SplashScreen.hideAsync();
    }
  }, [appLoadingStatus]);

  if (appLoadingStatus === "loading") {
    return null;
  }

  const serviceWorkerUrl = Constants.expoConfig?.extra?.serviceWorkerUrl;
  const loadingLabel = `${Updates.channel} ${serviceWorkerUrl}`;

  return (
    <View
      onLayout={onLayoutRootView}
      style={[
        styles.container,
        {
          backgroundColor: theme.custom.colors.background,
        },
      ]}
    >
      {webviewLoaded ? (
        <Providers>
          <StatusBar style="dark" />
          <RootNavigation colorScheme={theme.colorScheme as "dark" | "light"} />
        </Providers>
      ) : (
        <FullScreenLoading label={loadingLabel} />
      )}
    </View>
  );
}

function BackgroundHiddenWebView(): JSX.Element {
  const setInjectJavaScript = useStore(
    (state: any) => state.setInjectJavaScript
  );
  const ref = useRef(null);
  const serviceWorkerUrl = Constants.expoConfig?.extra?.serviceWorkerUrl;

  return (
    <View style={styles.webview}>
      <WebView
        ref={ref}
        source={{ uri: serviceWorkerUrl }}
        cacheMode="LOAD_CACHE_ELSE_NETWORK"
        cacheEnabled
        // NOTE: this MUST be true. Otherwise onMessage will not fire.
        // https://github.com/react-native-webview/react-native-webview/issues/1956
        limitsNavigationsToAppBoundDomains
        // onError={(error) => console.log("WebView error:", error)}
        // onHttpError={(error) => console.log("WebView HTTP error:", error)}
        // onLoad={(event) => {
        //   console.log("onLoad");
        // }}
        // onLoadEnd={(syntheticEvent) => {
        //   // update component to be aware of loading status
        //   // const { nativeEvent } = syntheticEvent;
        //   console.log("onLoadEnd");
        // }}
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
