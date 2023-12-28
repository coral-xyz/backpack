import {
  ETH_NATIVE_MINT,
  UniswapTokenList,
} from "@coral-xyz/secure-clients/legacyCommon";
import { atom } from "recoil";

// Ethereum token metadata
export const ethereumTokenMetadata = atom({
  key: "ethereumTokenData",
  default: () => {
    const ETH_LOGO_URI =
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png";

    const tokenMap: Map<string, any> = new Map(
      UniswapTokenList.tokens.map((t: any) => {
        return [t.address, t];
      })
    );
    tokenMap.set(ETH_NATIVE_MINT, {
      name: "Ethereum",
      address: ETH_NATIVE_MINT,
      chainId: 1,
      decimals: 18,
      symbol: "ETH",
      logoURI: ETH_LOGO_URI,
      extensions: {
        coingeckoId: "ethereum",
      },
    });
    return tokenMap;
  },
});
