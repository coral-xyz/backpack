import { useState, Suspense } from "react";
import {
  ActivityIndicator,
  Platform,
  Text,
  TextInput,
  View,
} from "react-native";

import { ErrorBoundary } from "react-error-boundary";
import { WebView } from "react-native-webview";

import { ScreenError, ScreenLoading } from "~components/index";

function Container() {
  const [inputUrl, setInputUrl] = useState("https://uniswap.io");
  const [url, setUrl] = useState(inputUrl);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <View style={{ flex: 1, paddingTop: Platform.OS === "ios" ? 80 : 30 }}>
      <TextInput
        value={inputUrl}
        onChangeText={setInputUrl}
        returnKeyType="go"
        autoCapitalize="none"
        onSubmitEditing={() => {
          if (inputUrl !== url) {
            setUrl(inputUrl);
            setIsLoading(true);
          }
        }}
        keyboardType="url"
        style={{
          color: "#fff",
          backgroundColor: "#000",
          borderRadius: 10,
          marginHorizontal: 10,
          paddingHorizontal: 20,
          height: 60,
        }}
      />

      <WebView
        source={{
          uri:
            url.startsWith("https://") || url.startsWith("http://")
              ? url
              : `https://${url}`,
        }}
        onLoad={() => setIsLoading(false)}
        style={{ flex: 1, backgroundColor: "yellow" }}
      />
      <LoadingView isLoading={isLoading} />
    </View>
  );
}

function LoadingView({ isLoading }: { isLoading: boolean }) {
  if (!isLoading) {
    return null;
  }

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        backgroundColor: "rgba(0,0,0,0.5)",
        paddingBottom: 10,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
      }}
    >
      <ActivityIndicator
        animating={isLoading}
        color="#fff"
        style={{ marginRight: 10 }}
      />
      <Text style={{ color: "#fff" }}>Loading...</Text>
    </View>
  );
}

export function BrowserScreen(): JSX.Element {
  return (
    <ErrorBoundary
      fallbackRender={({ error }) => <ScreenError error={error} />}
    >
      <Suspense fallback={<ScreenLoading />}>
        <Container />
      </Suspense>
    </ErrorBoundary>
  );
}
