import { useEffect, useState } from "react";

import * as Font from "expo-font";

import { useStore } from "@coral-xyz/common";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

type status = "loading" | "ready" | "error";

export function useLoadedAssets(): status {
  // const [intervalId, setIntervalId] = React.useState(0);
  // const [secondsPassed, setSecondsPassed] = React.useState(0);
  const [status, setStatus] = useState<status>("loading");
  const webviewLoaded = useStore((state) => state.injectJavaScript);

  const [fontsLoaded] = useFonts({
    Inter: Inter_400Regular,
    InterMedium: Inter_500Medium,
    InterSemiBold: Inter_600SemiBold,
    InterBold: Inter_700Bold,
  });

  // Load any resources or data that we need prior to rendering the app
  useEffect(() => {
    if (webviewLoaded) {
      load();
    }

    async function load() {
      try {
        await Font.loadAsync(MaterialCommunityIcons.font);
      } catch (e) {
        // We might want to provide this error information to an error reporting service
        console.warn(e);
      } finally {
        setStatus("ready");
      }
    }
  }, [webviewLoaded, fontsLoaded]);

  //
  // React.useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     setSecondsPassed(secondsPassed + 1);
  //   }, 1000);
  //
  //   // sets a error loading screen if something didn't load correctly
  //   if (secondsPassed > 7 && status === "loading") {
  //     setStatus("error");
  //     clearInterval(intervalId);
  //   }
  //
  //   return () => clearInterval(intervalId);
  // }, [secondsPassed]);

  if (fontsLoaded) {
    return status;
  }

  return "loading";
}
