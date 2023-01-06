import { Suspense, useCallback, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import {
  BACKGROUND_SERVICE_WORKER_READY,
  UI_RPC_METHOD_KEYRING_STORE_UNLOCK,
  useStore,
  WEB_VIEW_EVENTS,
} from "@coral-xyz/common";
import {
  NotificationsProvider,
  useBackgroundClient,
  useUser,
} from "@coral-xyz/recoil";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useTheme } from "@hooks";
import Constants from "expo-constants";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { RecoilRoot } from "recoil";

SplashScreen.preventAutoHideAsync();

import { useLoadedAssets } from "./hooks/useLoadedAssets";
import { RootNavigation } from "./navigation/RootNavigator";

export function App(): JSX.Element {
  return (
    <Suspense fallback={null}>
      <RecoilRoot>
        <BackgroundHiddenWebView />
        <Main />
      </RecoilRoot>
    </Suspense>
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

  // const background = useBackgroundClient();
  // const user = useUser();

  // uncomment this later for proper loading
  // useEffect(() => {
  //   async function unlock() {
  //     const password = "backpack";
  //     await background.request({
  //       method: UI_RPC_METHOD_KEYRING_STORE_UNLOCK,
  //       params: [password, user.uuid, user.username],
  //     });
  //   }
  //
  //   unlock();
  // }, []);

  return (
    <Providers>
      <SafeAreaView
        onLayout={onLayoutRootView}
        style={[
          styles.container,
          {
            backgroundColor:
              process.env.NODE_ENV === "development"
                ? "orange"
                : theme.custom.colors.background,
          },
        ]}
      >
        <StatusBar style={theme.colorScheme === "dark" ? "light" : "dark"} />
        <RootNavigation colorScheme={theme.colorScheme} />
      </SafeAreaView>
    </Providers>
  );
}

function maybeParseLog({
  channel,
  data,
}: {
  channel: string;
  data: any;
}): void {
  try {
    console.group(channel);

    if (channel === "mobile-logs") {
      const [name, value] = data;
      const color = name.includes("ERROR") ? "red" : "yellow";
      console.log("%c" + name, `color: ${color}`);
      console.log(value);
    } else if (channel === "mobile-fe-response") {
      console.log(data.wrappedEvent.channel);
      console.log(data.wrappedEvent.data);
    }
    console.groupEnd();
  } catch (error) {
    console.error(channel, error);
  }
}

function BackgroundHiddenWebView(): JSX.Element {
  const setInjectJavaScript = useStore(
    (state: any) => state.setInjectJavaScript
  );
  const ref = useRef(null);

  return (
    <View style={{ display: "none" }}>
      <WebView
        ref={ref}
        cacheMode="LOAD_CACHE_ELSE_NETWORK"
        cacheEnabled
        limitsNavigationsToAppBoundDomains
        source={{ uri: Constants?.expoConfig?.extra?.webviewUrl }}
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
