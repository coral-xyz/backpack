import type {
  RawMintString,
  SolanaTokenAccountWithKeyString,
} from "@coral-xyz/common";
import { useRecoilValue } from "recoil";

import * as atoms from "../../atoms";

export * from "./recentTransactionHelpers";
export * from "./useCompressedNfts";
export * from "./useJupiter";
export * from "./useLoadSplTokens";
export * from "./usePlugins";
export * from "./useRecentTransactions";
export * from "./useSolanaCommitment";
export * from "./useSolanaConnection";
export * from "./useSolanaExplorer";
export * from "./useSolanaTransaction";
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

export function useSolanaTokenAccount({
  publicKey,
  tokenAddress,
}: {
  publicKey: string;
  tokenAddress: string;
}): SolanaTokenAccountWithKeyString | null {
  return (
    useRecoilValue(atoms.solanaTokenAccountsMap({ tokenAddress, publicKey })) ??
    null
  );
}
