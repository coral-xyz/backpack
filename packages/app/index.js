import "react-native-get-random-values";
import "react-native-url-polyfill/auto";
import { registerRootComponent } from "expo";
import { setupClient, useStore } from "@coral-xyz/common";
import App from "./App";
import { RecoilRoot } from "recoil/native/recoil";
import { Suspense } from "react";
import { WebView } from "react-native-webview";
import { View } from "react-native";

function Background() {
  const setBackgroundWrapper = useStore((state) => state.setBackgroundWrapper);
  return (
    <View
      style={{
        display: "none",
      }}
    >
      <WebView
        ref={(ref) => {
          // XXX: temporary hack to ensure page is loaded
          setTimeout(() => {
            setBackgroundWrapper(ref.injectJavaScript);
          }, 500);
        }}
        source={{
          // XXX: this can only be a domain that's specified in
          //      app.json > ios.infoPlist.WKAppBoundDomains[]
          uri: "http://localhost:9333",
        }}
        onMessage={(event) =>
          // log messages sent to
          console.log({ event })
        }
        originWhitelist={["*"]}
        limitsNavigationsToAppBoundDomains
      />
    </View>
  );
}

const WaitingApp = () => {
  const backgroundWrapper = useStore((state) => state.backgroundWrapper);
  return backgroundWrapper ? <App /> : null;
};

const WrappedApp = () => (
  <Suspense fallback={null}>
    <RecoilRoot>
      <Background />
      <WaitingApp />
    </RecoilRoot>
  </Suspense>
);

setupClient();

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(WrappedApp);
