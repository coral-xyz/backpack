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

import { Providers } from "./Providers";
import { FullScreenLoading } from "./components";
import { useLoadedAssets } from "./hooks/useLoadedAssets";
import { RootNavigation } from "./navigation/RootNavigator";

SplashScreen.preventAutoHideAsync();

export function App(): JSX.Element {
  console.log("app");
  const appIsReady = useLoadedAssets();
  console.log("appIsReady", appIsReady);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  const renderError = useCallback(
    ({ error }: { error: { message: string } }) => (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>{error.message}</Text>
      </View>
    ),
    []
  );

  return (
    <View onLayout={onLayoutRootView} style={styles.container}>
      <ErrorBoundary fallbackRender={renderError}>
        <Suspense
          fallback={<FullScreenLoading label="loading service worker" />}
        >
          <RecoilRoot>
            <Main />
            <BackgroundHiddenWebView />
          </RecoilRoot>
        </Suspense>
      </ErrorBoundary>
    </View>
  );
}

function Main(): JSX.Element | null {
  const theme = useTheme();
  console.log("main");

  return (
    <Providers>
      <StatusBar />
      <RootNavigation colorScheme={theme.colorScheme as "dark" | "light"} />
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
  // const setInjectJavaScript = useStore(
  //   (state: any) => state.setInjectJavaScript
  // );
  const ref = useRef(null);
  const webviewUrl = getWebviewUrl();
  console.log("main", webviewUrl);

  return (
    <View style={{ flex: 1, backgroundColor: "yellow" }}>
      <WebView
        style={{ height: 200 }}
        ref={ref}
        limitsNavigationsToAppBoundDomains
        source={{ uri: webviewUrl }}
        onLoad={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.log("onload", nativeEvent.url);
        }}
        onLoadEnd={(syntheticEvent) => {
          // update component to be aware of loading status
          const { nativeEvent } = syntheticEvent;
          console.log("onloadend", nativeEvent.loading);
        }}
        onLoadStart={(syntheticEvent) => {
          // update component to be aware of loading status
          const { nativeEvent } = syntheticEvent;
          console.log("onloadstart", nativeEvent.loading);
        }}
        onLoadProgress={({ nativeEvent }) => {
          console.log("onloadprogress", nativeEvent.progress);
        }}
        onRenderProcessGone={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn("WebView Crashed: ", nativeEvent.didCrash);
        }}
        onNavigationStateChange={(navState) => {
          // Keep track of going back navigation within component
          console.log("on navigation state change", navState);
        }}
        onContentProcessDidTerminate={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn("Content process terminated, reloading", nativeEvent);
          // this.refs.webview.reload();
        }}
        onError={(error) => console.log("WebView error:", error)}
        onHttpError={(error) => console.log("WebView HTTP error:", error)}
        onMessage={(event) => {
          console.log("onMessage:event", event);
          // console.log(
          //   "ref.current.injectJavascript",
          //   ref.current?.injectJavascript
          // );
          // const msg = JSON.parse(event.nativeEvent.data);
          // if (msg.type === BACKGROUND_SERVICE_WORKER_READY) {
          //   // @ts-expect-error
          //   setInjectJavaScript(ref.current?.injectJavaScript);
          // } else {
          //   WEB_VIEW_EVENTS.emit("message", msg);
          // }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
