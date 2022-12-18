import type { Nft, NftCollection } from "@coral-xyz/common";
import { Blockchain, externalResourceUri } from "@coral-xyz/common";
import { selectorFamily } from "recoil";

import { solanaNftUriData } from "./token";

interface SolanaCollection extends NftCollection {
  items: (Nft & { publicKey: string; mint: string })[];
}

export const solanaNftCollections = selectorFamily<
  NftCollection[],
  {
    publicKey: string;
    connectionUrl: string;
  }
>({
  key: "solanaNftCollections",
  get:
    ({ publicKey, connectionUrl }) =>
    ({ get }) => {
      //
      // Get all the collections.
      //
      const metadata = get(solanaNftUriData({ connectionUrl, publicKey }));

      //
      // Bucket all the nfts by collection name.
      //
      const collections = new Map<string, SolanaCollection>();
      for (const value of metadata.values()) {
        let [collectionId, collection, metadataCollectionId] = (() => {
          // TODO: figure out a better way to group collections, e.g. a whitelist by creator?
          if (value.tokenMetaUriData.collection) {
            const collectionId = value.tokenMetaUriData.collection
																			.name as string;
						const metadataCollectionId = value.metadata.collection?.key || "";
            const collection = collections.get(
              value.tokenMetaUriData.collection.name
            );
            return [collectionId, collection, metadataCollectionId];
          } else {
            // TODO.
            return ["No Collection", collections.get("No Collection"), ""];
          }
        })();
        if (!collection) {
          collections.set(collectionId, {
            // TODO this can collide easily, better field for an ID?
            id: collectionId,
						metadataCollectionId,
            name: collectionId,
            symbol: value.metadata.data.symbol,
            tokenType: "",
            totalSupply: "",
            items: [],
          });
        }
        collections.get(collectionId)!.items.push({
          id: value.publicKey,
          blockchain: Blockchain.SOLANA,
          publicKey: value.publicKey,
          mint: value.metadata.mint,
          name: value.metadata.data.name ?? value.tokenMetaUriData.name,
          description: value.tokenMetaUriData.description,
          externalUrl: externalResourceUri(
            value.tokenMetaUriData.external_url?.replace(/\0/g, "")
          ),
          imageUrl: externalResourceUri(
            value.tokenMetaUriData.image?.replace(/\0/g, "")
          ),
          attributes: value.tokenMetaUriData.attributes?.map(
            (a: { trait_type: string; value: string }) => ({
              traitType: a.trait_type,
              value: a.value,
            })
          ),
        });
      }

      //
      // Sort for consistent UI presentation.
      //
      return [...collections.values()]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((c) => {
          return {
            ...c,
            items: c.items.sort((a, b) => a.id.localeCompare(b.id)),
          };
        });
    },
});
