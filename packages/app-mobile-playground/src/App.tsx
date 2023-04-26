import { StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { config, PrimaryButton, TamaguiProvider } from "@coral-xyz/tamagui";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";

import { Pill, WalletAddressLabel } from "./components/index";

function Providers({ children }) {
  const [loaded] = useFonts({
    Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
    InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
  });

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <TamaguiProvider config={config} defaultTheme="light">
        <SafeAreaView style={styles.container}>{children}</SafeAreaView>
      </TamaguiProvider>
    </SafeAreaProvider>
  );
}

function Components() {
  return (
    <View>
      <PrimaryButton onPress={() => console.log("pressed")} label="Hi" />
      <WalletAddressLabel
        name="Peter"
        publicKey="5iM4vFHv7vdiZJYm7rQwHGgvpp9zHEwZHGNbNATFF5To"
      />
      <Pill />
    </View>
  );
}

export function App() {
  return (
    <Providers>
      <Components />
    </Providers>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eee",
  },
});
