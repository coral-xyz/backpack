import { Suspense, useCallback, useEffect, useRef } from "react";
import { Button, StyleSheet, Text, View } from "react-native";

import Constants from "expo-constants";
import * as Device from "expo-device";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";

import {
  BACKGROUND_SERVICE_WORKER_READY,
  useStore,
  WEB_VIEW_EVENTS,
} from "@coral-xyz/common";
import { NotificationsProvider } from "@coral-xyz/recoil";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useTheme } from "@hooks";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { RecoilRoot, useRecoilCallback, useRecoilSnapshot } from "recoil";

import { ErrorBoundary } from "@components/ErrorBoundary";

import { useLoadedAssets } from "./hooks/useLoadedAssets";
import { RootNavigation } from "./navigation/RootNavigator";

SplashScreen.preventAutoHideAsync();

// eslint-disable-next-line
function DebugObserver(): null {
  const snapshot = useRecoilSnapshot();
  useEffect(() => {
    console.debug("recoil::start");
    for (const node of snapshot.getNodes_UNSTABLE({ isModified: true })) {
      console.debug("recoil::", node.key, snapshot.getLoadable(node));
    }
    console.debug("recoil::end");
  }, [snapshot]);

  return null;
}

// eslint-disable-next-line
function DebugButton(): JSX.Element {
  const onPress = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        console.group("recoil");
        console.debug("Atom values:");
        for (const node of snapshot.getNodes_UNSTABLE()) {
          const value = await snapshot.getPromise(node);
          console.debug(node.key, value);
        }
        console.groupEnd();
      },
    []
  );

  return (
    <View style={{ position: "absolute", top: 60, zIndex: 9999 }}>
      <Button onPress={onPress} title="Dump recoil state" />
    </View>
  );
}

export function App(): JSX.Element {
  return (
    <ErrorBoundary>
      <Suspense fallback={null}>
        <RecoilRoot>
          <BackgroundHiddenWebView />
          <Main />
        </RecoilRoot>
      </Suspense>
    </ErrorBoundary>
  );
}

function Providers({ children }: { children: JSX.Element }): JSX.Element {
  return (
    <SafeAreaProvider>
      <NotificationsProvider>
        <ActionSheetProvider>
          <BottomSheetModalProvider>{children}</BottomSheetModalProvider>
        </ActionSheetProvider>
      </NotificationsProvider>
    </SafeAreaProvider>
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
        <StatusBar style={theme.colorScheme === "dark" ? "light" : "dark"} />
        <RootNavigation colorScheme={theme.colorScheme} />
      </View>
    </Providers>
  );
}

function maybeParseLog({
  channel,
  data,
}: {
  channel:
    | "mobile-logs"
    | "mobile-fe-response"
    | "mobile-bg-response"
    | "mobile-bg-request";
  data: any;
}): void {
  try {
    switch (channel) {
      case "mobile-logs": {
        const [name, ...rest] = data;
        const color = name.includes("ERROR") ? "red" : "yellow";
        console.group(`${channel}:${name}`);
        console.log("%c" + `${channel}:` + name, `color: ${color}`);
        console.log(rest);
        console.log("%c" + "---", `color: ${color}`);
        console.groupEnd();
        break;
      }
      case "mobile-bg-response":
      case "mobile-bg-request":
      case "mobile-fe-response": {
        const name = data.wrappedEvent.channel;
        const color = "orange";
        console.log("%c" + `${channel}:${name}`, `color: ${color}`);
        console.log(data.wrappedEvent.data);
        console.log("%c" + "---", `color: ${color}`);
        break;
      }
      default: {
        console.group(channel);
        console.log("%c" + channel, `color: green`);
        console.log(data);
        console.groupEnd();
      }
    }
  } catch (error) {
    console.error(channel, error);
  }
}

function BackgroundHiddenWebView(): JSX.Element {
  const setInjectJavaScript = useStore(
    (state: any) => state.setInjectJavaScript
  );
  const ref = useRef(null);
  const { localWebViewUrl, remoteWebViewUrl } =
    Constants?.expoConfig?.extra || {};

  const webViewUrl = Device.isDevice ? remoteWebViewUrl : localWebViewUrl;

  return (
    <View style={{ display: "none" }}>
      <WebView
        ref={ref}
        cacheMode="LOAD_CACHE_ELSE_NETWORK"
        cacheEnabled
        limitsNavigationsToAppBoundDomains
        source={{
          uri: webViewUrl,
        }}
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
});
