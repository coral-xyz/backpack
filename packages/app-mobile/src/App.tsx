import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { UI_RPC_METHOD_KEYRING_STORE_UNLOCK } from "@coral-xyz/common";
import { NotificationsProvider, useBackgroundClient } from "@coral-xyz/recoil";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

import "react-native-gesture-handler";

import { useLoadedAssets } from "./hooks/useLoadedAssets";
import Navigation from "./navigation";

function Providers({ children }: { children: JSX.Element }) {
  return (
    <NotificationsProvider>
      <SafeAreaProvider>
        <ActionSheetProvider>
          <BottomSheetModalProvider>{children}</BottomSheetModalProvider>
        </ActionSheetProvider>
      </SafeAreaProvider>
    </NotificationsProvider>
  );
}

export default function App() {
  const isLoadingComplete = useLoadedAssets();
  const background = useBackgroundClient();
  const colorScheme = useColorScheme();

  // uncomment this later for proper loading
  useEffect(() => {
    async function unlock() {
      await background.request({
        method: UI_RPC_METHOD_KEYRING_STORE_UNLOCK,
        params: ["backpack"],
      });
    }

    unlock();
  }, []);

  if (!isLoadingComplete) {
    return null;
  }

  return (
    <Providers>
      <Navigation colorScheme={colorScheme} />
    </Providers>
  );
}
