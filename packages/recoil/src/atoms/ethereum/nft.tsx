import { atomFamily, selectorFamily } from "recoil";
import { ALCHEMY_ETHEREUM_MAINNET_API_KEY } from "@coral-xyz/common";

export const ethereumNft = atomFamily<
  Array<any>,
  {
    address: string;
  }
>({
  key: "ethereumNft",
  default: selectorFamily({
    key: "ethereumNftDefault",
    get:
      ({ address }: { address: string }) =>
      async () => {
        const url = `https://eth-mainnet.g.alchemy.com/nft/v2/${ALCHEMY_ETHEREUM_MAINNET_API_KEY}/getNFTs?owner=${address}`;
        const response = await fetch(url);
        return await response.json();
      },
  }),
});
