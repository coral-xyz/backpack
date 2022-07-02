import { Suspense, useRef } from "react";
import { View, Text } from "react-native";
import { WebView } from "react-native-webview";
import { registerRootComponent } from "expo";
import { useStore } from "@coral-xyz/common";
import { RecoilRoot } from "recoil/native/recoil";
import App from "./src/App";
import "react-native-get-random-values";
import "react-native-url-polyfill/auto";

function Background() {
  const webViewRef = useRef(null);
  const setInjectJavaScript = useStore((state) => state.setInjectJavaScript);
  return (
    <View
      style={{
        height: 300,
        // display: "none",
      }}
    >
      <WebView
        ref={webViewRef}
        onLoadEnd={() => {
          setInjectJavaScript(webViewRef.current.injectJavaScript);
        }}
        source={{
          // XXX: this can only be a domain that's specified in
          //      app.json > ios.infoPlist.WKAppBoundDomains[]
          uri: "http://localhost:9333",
        }}
        onMessage={(event) =>
          // log messages sent to
          console.log(JSON.parse(event.nativeEvent.data))
        }
        originWhitelist={["*"]}
        limitsNavigationsToAppBoundDomains
      />
    </View>
  );
}

const WaitingApp = () => {
  const injectJavaScript = useStore((state) => state.injectJavaScript);
  return injectJavaScript ? <App /> : null;
};

const WrappedApp = () => (
  <Suspense fallback={null}>
    <RecoilRoot>
      <Background />
      <WaitingApp />
    </RecoilRoot>
  </Suspense>
);

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(WrappedApp);
