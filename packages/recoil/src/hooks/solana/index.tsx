import type { RawMintString } from "@coral-xyz/common";
import { useRecoilValue } from "recoil";

import * as atoms from "../../atoms";

export * from "./useJupiter";
export * from "./useLoadSplTokens";
export * from "./usePlugins";
export * from "./useRecentTransactions";
export * from "./useSolanaCommitment";
export * from "./useSolanaConnection";
export * from "./useSolanaExplorer";
export * from "./useSplTokenRegistry";

export function useSolanaTokenMint({
  publicKey,
  tokenAddress,
}: {
  publicKey: string;
  tokenAddress: string;
}): RawMintString {
  return useRecoilValue(atoms.solanaTokenMint({ tokenAddress, publicKey }));
}
