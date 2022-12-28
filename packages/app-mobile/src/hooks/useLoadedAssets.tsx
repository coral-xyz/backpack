import React from "react";
import { useStore } from "@coral-xyz/common";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as Font from "expo-font";

export function useLoadedAssets(): boolean {
  const [isLoadingComplete, setLoadingComplete] = React.useState(false);
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
        setLoadingComplete(true);
      }
    }
  }, [webviewLoaded]);

  return isLoadingComplete;
}
