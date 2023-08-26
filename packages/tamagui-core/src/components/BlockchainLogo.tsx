import { Image } from "react-native";
import type { Blockchain } from "@coral-xyz/common";
import { BLOCKCHAIN_COMMON } from "@coral-xyz/common";

function getBlockchainLogo(blockchain: Blockchain) {
  return BLOCKCHAIN_COMMON[blockchain].logoUri;
}

export function BlockchainLogo({
  size = 24,
  blockchain,
}: {
  size?: number;
  blockchain: Blockchain;
}) {
  const uri = getBlockchainLogo(blockchain);
  return <Image source={{ uri }} style={{ width: size, height: size }} />;
}
