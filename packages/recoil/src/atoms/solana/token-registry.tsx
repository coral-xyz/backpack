import { getTokenRegistry } from "@coral-xyz/secure-clients/legacyCommon";
import type { TokenInfo } from "@solana/spl-token-registry";
import { atom, selector } from "recoil";

export const SOL_LOGO_URI =
  "https://assets.coingecko.com/coins/images/4128/large/solana.png?1640133422";

export const splTokenRegistry = atom<Map<string, TokenInfo> | null>({
  key: "splTokenRegistry",
  default: selector({
    key: "splTokenRegistryDefault",
    get: async () => getTokenRegistry(),
  }),
});
