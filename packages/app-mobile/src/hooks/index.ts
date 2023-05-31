import { Blockchain } from "@coral-xyz/common";

import Images from "../Images";

export { useTheme } from "./useTheme";

// TODO(peter) consolidate between extension/mobile-app or just live on S3
export function getBlockchainLogo(blockchain: Blockchain) {
  switch (blockchain) {
    case Blockchain.ETHEREUM:
      return Images.ethereumLogo;
    case Blockchain.SOLANA:
      return Images.solanaLogo;
    default:
      throw new Error(`invalid blockchain ${blockchain}`);
  }
}
