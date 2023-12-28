import type { RawMintWithProgramIdString } from "@coral-xyz/secure-clients/legacyCommon";
import { useRecoilValue } from "recoil";

import * as atoms from "../../atoms";

export * from "./recentTransactionHelpers";
export { useAppStoreMetaLoadable } from "./useAppStoreMeta";
export { useCollectibleXnftLoadable } from "./useCollectibleXnft";
export * from "./useJupiter";
export * from "./useLoadSplTokens";
export * from "./usePlugins";
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
}): RawMintWithProgramIdString {
  return useRecoilValue(atoms.solanaTokenMint({ tokenAddress, publicKey }));
}
