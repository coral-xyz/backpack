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
import { secureBackgroundSenderAtom } from "@coral-xyz/recoil";
import {
  extensionDB,
  KeyringStore,
  secureStore,
} from "@coral-xyz/secure-background/legacyExport";
import {
  BackendNotificationBroadcaster,
  LocalTransportReceiver,
  LocalTransportSender,
} from "@coral-xyz/secure-client";
import { startSecureService } from "@coral-xyz/secure-client/service";
import { SECURE_EVENTS } from "@coral-xyz/secure-client/types";
import { SecureUI } from "@coral-xyz/secure-client/ui";
import { EventEmitter as EventEmitter3 } from "eventemitter3";
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

// SETUP SECURE BACKGROUND
const events = new EventEmitter3();
const keyringStore = new KeyringStore(events, secureStore);
const notificationBroadcaster = new BackendNotificationBroadcaster(events);
const secureBackgroundReceiver = new LocalTransportReceiver(events, {
  request: "background-request",
  response: "background-response",
});
const secureBackgroundSender = new LocalTransportSender(
  {
    address: "app-mobile",
    name: "Backpack Mobile",
    context: "mobile",
  },
  events,
  { request: "background-request", response: "background-response" }
);
const secureUIBackgroundSender = new LocalTransportSender<
  SECURE_EVENTS,
  "confirmation"
>(
  {
    address: "app-mobile-secure-background",
    name: "Backpack Mobile",
    context: "background",
  },
  events,
  { request: "secureui-request", response: "secureui-response" }
);
const secureUIReceiver = new LocalTransportReceiver<
  SECURE_EVENTS,
  "confirmation"
>(events, { request: "secureui-request", response: "secureui-response" });
const secureUISender = new LocalTransportSender(
  {
    address: "app-mobile",
    name: "Backpack Mobile",
    context: "secureUI",
  },
  events,
  { request: "background-request", response: "background-response" }
);

startSecureService(
  {
    notificationBroadcaster,
    secureUIClient: secureUIBackgroundSender,
    secureServer: secureBackgroundReceiver,
    secureDB: extensionDB,
  },
  keyringStore
);
/// SETUP SECURE BACKGROUND

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
        <RecoilRoot
          initializeState={({ set }) => {
            set(secureBackgroundSenderAtom, secureBackgroundSender);
          }}
        >
          <Main />
        </RecoilRoot>
      </Suspense>
      <SecureUI
        secureUIReceiver={secureUIReceiver}
        secureBackgroundSender={secureUISender}
      />
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
