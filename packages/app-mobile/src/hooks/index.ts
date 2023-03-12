import { Blockchain } from "@coral-xyz/common";

import Images from "../Images";

export { useIsONELive } from "./useIsONELive";
export { useIsValidAddress } from "./useIsValidAddress";
export { useTheme } from "./useTheme";

// TODO(peter) consolidate between extension/mobile-app or just live on S3
export function getBlockchainLogo(blockchain: Blockchain): string {
  switch (blockchain) {
    case Blockchain.ETHEREUM:
      return Images.ethereumLogo;
    case Blockchain.SOLANA:
      return Images.solanaLogo;
    default:
      throw new Error(`invalid blockchain ${blockchain}`);
  }
}
