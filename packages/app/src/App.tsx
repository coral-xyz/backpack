import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { Keypair } from "@solana/web3.js";
import { useKeyringStoreState } from "@coral-xyz/recoil";

export default function App() {
  const keyringStoreState = useKeyringStoreState();
  console.log("keyring store state", keyringStoreState);

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
