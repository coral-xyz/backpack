import { useEffect, useState } from "react";

import { useStore } from "@coral-xyz/common";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

export function useLoadedAssets() {
  // console.log("useLoadedAssets:init");
  // const [appIsReady, setAppIsReady] = useState(false);
  // console.log("useLoadedAssets:appIsReady", appIsReady);
  // console.log("useLoadedAssets:webViewLoaded", webviewLoaded);

  const [fontsLoaded] = useFonts({
    Inter: Inter_400Regular,
    InterMedium: Inter_500Medium,
    InterSemiBold: Inter_600SemiBold,
    InterBold: Inter_700Bold,
    ...MaterialCommunityIcons.font,
    ...MaterialIcons.font,
  });

  return fontsLoaded;
}
