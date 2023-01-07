import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Row } from "@components";
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
import { useBlockchainLogo, useTheme } from "@hooks";

// TODO move this
export type Token = ReturnType<typeof useBlockchainTokensSorted>[number];

export function TableHeader({
  onPress,
  visible,
  blockchain,
  disableToggle = false,
  subtitle,
  rightSide,
}: {
  blockchain: Blockchain;
  visible: boolean;
  onPress: () => void;
  disableToggle?: boolean;
  subtitle?: JSX.Element;
  rightSide?: JSX.Element;
}) {
  const theme = useTheme();
  const title = toTitleCase(blockchain);
  const logo = useBlockchainLogo(blockchain);

  return (
    <Pressable
      disabled={disableToggle}
      onPress={onPress}
      style={styles.tableHeader}
    >
      <Row>
        <Image style={styles.logoContainer} source={logo} />
        <Text style={[styles.title, { color: theme.custom.colors.fontColor }]}>
          {title}
        </Text>
        {subtitle ? subtitle : null}
      </Row>
      {rightSide ? (
        rightSide
      ) : (
        <MaterialIcons
          name={visible ? "keyboard-arrow-up" : "keyboard-arrow-down"}
          size={18}
          color={theme.custom.colors.fontColor}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#eee",
    flex: 1,
  },
  title: {
    fontWeight: "500",
    lineHeight: 24,
    fontSize: 14,
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  logoContainer: {
    width: 12,
    height: 12,
    marginRight: 8,
  },
});
