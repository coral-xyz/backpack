import { Suspense, useRef } from "react";
import { View, Text } from "react-native";
import { WebView } from "react-native-webview";
import { RecoilRoot } from "recoil/native/recoil";
import { registerRootComponent } from "expo";
import { useStore } from "@coral-xyz/common";
import App from "./src/App";
import "react-native-get-random-values";
import "react-native-url-polyfill/auto";

function WrappedApp() {
  return (
    <Suspense fallback={null}>
      <RecoilRoot>
        <Background />
        <WaitingApp />
      </RecoilRoot>
    </Suspense>
  );
}

function Background() {
  //  const webViewRef = useRef(null);
  const setInjectJavaScript = useStore((state) => state.setInjectJavaScript);
  return (
    <View
      style={{
        height: 300,
        // display: "none",
      }}
    >
      <WebView
        ref={(ref) => {
          // XXX: timeout is a temporary hack to ensure page is loaded
          setTimeout(() => {
            // put the injectJavaScript function in a global observable
            // store so that it can be used here & in @coral-xyz/common
            setInjectJavaScript(ref.injectJavaScript);
          }, 1_000);
        }}
        source={{
          // XXX: this can only be a domain that's specified in
          //      app.json > ios.infoPlist.WKAppBoundDomains[]
          uri: "http://localhost:9333",
        }}
        onMessage={(event) => {
          //
          // Receives messages from the webview back to react-native code.
          //
          console.log(...JSON.parse(event.nativeEvent.data));
        }}
        originWhitelist={["*"]}
        limitsNavigationsToAppBoundDomains
      />
    </View>
  );
}

function WaitingApp() {
  const injectJavaScript = useStore((state) => state.injectJavaScript);
  return injectJavaScript ? <App /> : null;
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(WrappedApp);

/*&
        onLoadEnd={() => {
          setInjectJavaScript(webViewRef.current.injectJavaScript);
        }}
*/
