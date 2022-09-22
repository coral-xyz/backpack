import { selector } from "recoil";
import { Blockchain } from "@coral-xyz/common";
import { Nft, NftCollection } from "@coral-xyz/common";
import { ethereumNftCollections } from "./ethereum/nft";
import { solanaNftCollections } from "./solana/nft";

/**
 * Full token metadata for all NFTs.
 */
export const nftMetadata = selector<Map<string, Nft>>({
  key: "nftMetadata",
  get: ({ get }: any) => {
    const allNftData = Object.values(get(nftCollections))
      .flat()
      .map((c: NftCollection) => c.items)
      .flat();
    return new Map(allNftData.map((nft: Nft) => [nft.id, nft]));
  },
});

/**
 * All NFT collections keyed by Blockchain.
 */
export const nftCollections = selector({
  key: "nftCollections",
  get: ({ get }) => {
    const solana = get(solanaNftCollections);
    const ethereum = get(ethereumNftCollections);
    return {
      [Blockchain.SOLANA]: solana,
      [Blockchain.ETHEREUM]: ethereum,
    };
  },
});
