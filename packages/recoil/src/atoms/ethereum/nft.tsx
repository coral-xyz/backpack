import { atomFamily, selectorFamily } from "recoil";
import { ethersContext } from "./provider";

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
      async ({ get }: any) => {
        /**
        const { provider: ethereumProvider } = get(ethersContext);
        const ethereumNfts = await ethereumProvider.send("getNFTs", [
          {
            owner: address,
            withMetadata: true,
          },
        ]);
        console.log(ethereumNfts);
        **/
        return [];
      },
  }),
});
