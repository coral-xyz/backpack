import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { Keypair } from "@solana/web3.js";
import { useKeyringStoreState } from "@coral-xyz/recoil";

export default function App() {
  // XXX: uncommenting the line below will currently break the app
  const keyringStoreState = useKeyringStoreState();
  console.log("ARMANI krss", keyringStoreState);
  return (
    <View style={styles.container}>
      <Text>{Keypair.generate().publicKey.toString()}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ff0000",
    alignItems: "center",
    justifyContent: "center",
  },
});
