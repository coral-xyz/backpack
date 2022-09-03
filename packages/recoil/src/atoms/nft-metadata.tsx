import { selector } from "recoil";
import { Nft, NftCollection } from "@coral-xyz/common";
import { ethereumNftCollections } from "./ethereum/nft";
import { solanaNftCollections } from "./solana/nft";

/**
 * Full token metadata for all NFTs
 */
export const nftMetadata = selector<Map<string, Nft>>({
  key: "nftMetadata",
  get: ({ get }: any) => {
    const allNftData = [
      ...get(ethereumNftCollections).map((v: NftCollection) => v.items),
      ...get(solanaNftCollections).map((v: NftCollection) => v.items),
    ].flat();
    return new Map(allNftData.map((nft: Nft) => [nft.id, nft]));
  },
});
