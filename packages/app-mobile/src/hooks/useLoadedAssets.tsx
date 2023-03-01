import React from "react";

import * as Font from "expo-font";

import { useStore } from "@coral-xyz/common";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

type status = "loading" | "ready" | "error";

export function useLoadedAssets(): status {
  const [intervalId, setIntervalId] = React.useState(0);
  const [secondsPassed, setSecondsPassed] = React.useState(0);
  const [isLoadingComplete, setLoadingComplete] =
    React.useState<status>("loading");
  const webviewLoaded = useStore((state) => state.injectJavaScript);

  // Load any resources or data that we need prior to rendering the app
  React.useEffect(() => {
    if (webviewLoaded) {
      loadResourcesAndDataAsync();
    }
    async function loadResourcesAndDataAsync() {
      try {
        // Load fonts
        await Font.loadAsync(MaterialCommunityIcons.font);
      } catch (e) {
        // We might want to provide this error information to an error reporting service
        console.warn(e);
      } finally {
        setLoadingComplete("ready");
      }
    }
  }, [webviewLoaded]);
  //
  // React.useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     setSecondsPassed(secondsPassed + 1);
  //   }, 1000);
  //
  //   // sets a error loading screen if something didn't load correctly
  //   if (secondsPassed > 7 && isLoadingComplete === "loading") {
  //     setLoadingComplete("error");
  //     clearInterval(intervalId);
  //   }
  //
  //   return () => clearInterval(intervalId);
  // }, [secondsPassed]);

  return isLoadingComplete;
}
