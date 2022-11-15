import "react-native-gesture-handler";

import { NotificationsProvider } from "@coral-xyz/recoil";
import { useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useLoadedAssets } from "./hooks/useLoadedAssets";
import Navigation from "./navigation";

function Providers({ children }: { children: JSX.Element }) {
  return (
    <NotificationsProvider>
      <SafeAreaProvider>{children}</SafeAreaProvider>
    </NotificationsProvider>
  );
}

export default function App() {
  const isLoadingComplete = useLoadedAssets();
  const colorScheme = useColorScheme();

  if (!isLoadingComplete) {
    return null;
  }

  return (
    <Providers>
      <Navigation colorScheme={colorScheme} />
    </Providers>
  );
}
