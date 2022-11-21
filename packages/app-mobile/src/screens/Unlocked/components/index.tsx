import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { Blockchain } from "@coral-xyz/common";
import {
  // ETH_NATIVE_MINT,
  // NAV_COMPONENT_TOKEN,
  // SOL_NATIVE_MINT,
  toTitleCase,
  // walletAddressDisplay,
} from "@coral-xyz/common";
import type { useBlockchainTokensSorted } from "@coral-xyz/recoil";
import { MaterialIcons } from "@expo/vector-icons";
import { useBlockchainLogo } from "@hooks";

// TODO move this
export type Token = ReturnType<typeof useBlockchainTokensSorted>[number];

export function RowSeparator() {
  return <View style={styles.rowSeparator} />;
}

export function TableHeader({
  onPress,
  visible,
  blockchain,
}: {
  blockchain: Blockchain;
  visible: boolean;
  onPress: () => void;
}) {
  const title = toTitleCase(blockchain);
  const logo = useBlockchainLogo(blockchain);

  return (
    <Pressable onPress={onPress} style={styles.tableHeader}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Image style={styles.logoContainer} source={logo} />
        <Text>{title}</Text>
      </View>
      <MaterialIcons
        name={visible ? "keyboard-arrow-up" : "keyboard-arrow-down"}
        size={24}
        color="black"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#eee",
    flex: 1,
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 30,
    padding: 8,
  },
  logoContainer: {
    width: 12,
    height: 12,
    backgroundColor: "#000",
    marginRight: 8,
  },
  rowSeparator: {
    height: 12,
  },
});
