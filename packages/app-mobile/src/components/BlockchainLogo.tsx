import { Image, StyleSheet } from "react-native";

import { Blockchain } from "@coral-xyz/common";

import { getBlockchainLogo } from "~hooks/index";

export function BlockchainLogo({
  size,
  blockchain,
}: {
  size?: number;
  blockchain: Blockchain;
}) {
  const logo = getBlockchainLogo(blockchain);
  return (
    <Image
      source={logo}
      style={[styles.logoContainer, { width: size, height: size }]}
    />
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
});
