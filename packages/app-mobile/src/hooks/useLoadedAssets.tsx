import React from "react";
import { useStore } from "@coral-xyz/common";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as Font from "expo-font";

type status = "loading" | "ready" | "error";

export function useLoadedAssets(): status {
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

  React.useEffect(() => {
    const id = setTimeout(() => {
      setSecondsPassed(secondsPassed + 1);
    }, 1000);

    // sets a error loading screen if something didn't load correctly
    if (secondsPassed > 7 && isLoadingComplete === "loading") {
      setLoadingComplete("error");
    }

    return () => clearTimeout(id);
  }, [secondsPassed]);

  return isLoadingComplete;
}
