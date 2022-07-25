import "react-native-url-polyfill/auto";
import {
  BACKGROUND_SERVICE_WORKER_READY,
  useStore,
  WEB_VIEW_EVENTS,
} from "@coral-xyz/common";
import { registerRootComponent } from "expo";
import { StatusBar } from "expo-status-bar";
import { useRef, Suspense } from "react";
import { Platform, SafeAreaView, StyleSheet, View } from "react-native";
import "react-native-get-random-values";
import { WebView } from "react-native-webview";
import { RecoilRoot } from "recoil/native/recoil";
import App from "./src/App";

function WrappedApp() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <Suspense fallback={null}>
        <RecoilRoot>
          <Background />
          <WaitingApp />
        </RecoilRoot>
      </Suspense>
    </SafeAreaView>
  );
}

function Background() {
  const setInjectJavaScript = useStore((state) => state.setInjectJavaScript);
  const ref = useRef(null);

  return (
    <View
      style={{
        display: "none",
      }}
    >
      <WebView
        cacheEnabled
        cacheMode="LOAD_CACHE_ELSE_NETWORK"
        ref={ref}
        source={{
          uri:
            Platform.OS === "android"
              ? // temporary hack as android can't access localhost. Using
                // `adb -s emulator-5554 reverse tcp:9333 tcp:9333` is not
                // reliable. ngrok & localtunnel don't work with dev server.
                "https://fc9e097a.backpack.pages.dev"
              : // serviceworkers must be used with SSL (unless its localhost)
                // & expo iOS apps can only load from localhost in dev mode
                // because of restrictions imposed by WKAppBoundDomains.
                // Need to find a workaround to be able to test on iOS devices
                // in dev, possibly using a custom plugin that'd allow access
                // to a non-localhost URL that is specific for each build.
                "http://localhost:9333",
        }}
        onMessage={(event) => {
          const msg = JSON.parse(event.nativeEvent.data);
          if (msg.type === BACKGROUND_SERVICE_WORKER_READY) {
            setInjectJavaScript(ref.current.injectJavaScript);
          } else {
            WEB_VIEW_EVENTS.emit("message", msg);
          }
        }}
        limitsNavigationsToAppBoundDomains
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    backgroundColor: "#1D1D20",
    color: "#FFFFFF",
  },
});

function WaitingApp() {
  const injectJavaScript = useStore((state) => state.injectJavaScript);
  return injectJavaScript ? <App /> : null;
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(WrappedApp);
