import { atom, selector } from "recoil";
import { ethereumTokenData, ETH_NATIVE_MINT } from "@coral-xyz/common";
// spl-token-registry confirms to Uniswap token-list schema so can use type
import { TokenInfo } from "@solana/spl-token-registry";

export const ethereumTokenMetadata = atom<Map<string, TokenInfo> | null>({
  key: "ethereumTokenMetadata",
  default: selector({
    key: "ethereumTokenMetadataDefault",
    get: () => {
      return ethereumTokenData();
    },
  }),
});
