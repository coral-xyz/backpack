import "react-native-get-random-values";
import "react-native-url-polyfill/auto";

// Import the the ethers shims (**BEFORE** ethers)
import "@ethersproject/shims";

import {
  BACKGROUND_SERVICE_WORKER_READY,
  useStore,
  WEB_VIEW_EVENTS,
} from "@coral-xyz/common";
import Constants from "expo-constants";
import { StatusBar } from "expo-status-bar";
import { Suspense, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { RecoilRoot } from "recoil";

import App from "./src/App";

const LOCALHOST_WEBVIEW_URI = "http://localhost:9333";

const WEBVIEW_URI = (() => {
  if (process.env.NODE_ENV === "production") {
    return Constants.manifest.extra.url || alert("No WEBVIEW_URI");
  } else {
    return Constants.manifest.extra.url || LOCALHOST_WEBVIEW_URI;
  }
})();

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
          uri: WEBVIEW_URI,
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

export default function WrappedApp() {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Suspense fallback={null}>
        <RecoilRoot>
          <Background />
          <WaitingApp />
        </RecoilRoot>
      </Suspense>
    </View>
  );
}
