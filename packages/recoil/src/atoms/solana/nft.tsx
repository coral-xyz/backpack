import { selector } from "recoil";
import { externalResourceUri, NftCollection, Nft } from "@coral-xyz/common";
import { customSplTokenAccounts } from "./token";
import { solanaConnectionUrl } from "./preferences";
import { solanaPublicKey } from "../wallet";

interface SolanaCollection extends NftCollection {
  items: (Nft & { publicKey: string; mint: string })[];
}

export const solanaNftCollections = selector<NftCollection[]>({
  key: "solanaNftCollections",
  get: ({ get }) => {
    //
    // Get all the collections.
    //
    const connectionUrl = get(solanaConnectionUrl)!;
    const publicKey = get(solanaPublicKey)!;
    const { splNftMetadata: metadata } = get(
      customSplTokenAccounts({ connectionUrl, publicKey })
    );

    //
    // Bucket all the nfts by collection name.
    //
    const collections = new Map<string, SolanaCollection>();
    for (const value of metadata.values()) {
      let [collectionId, collection] = (() => {
        // TODO: figure out a better way to group collections, e.g. a whitelist by creator?
        if (value.tokenMetaUriData.collection) {
          const collectionId = value.tokenMetaUriData.collection.name as string;
          const collection = collections.get(
            value.tokenMetaUriData.collection.name
          );
          return [collectionId, collection];
        } else {
          // TODO.
          return ["No Collection", collections.get("No Collection")];
        }
      })();
      if (!collection) {
        collections.set(collectionId, {
          // TODO this can collide easily, better field for an ID?
          id: collectionId,
          name: collectionId,
          symbol: value.metadata.data.symbol,
          tokenType: "",
          totalSupply: "",
          items: [],
        });
      }
      collections.get(collectionId)!.items.push({
        id: value.publicKey,
        publicKey: value.publicKey,
        mint: value.metadata.mint,
        name: value.tokenMetaUriData.name,
        description: value.tokenMetaUriData.description,
        externalUrl: externalResourceUri(value.tokenMetaUriData.external_url),
        imageUrl: externalResourceUri(value.tokenMetaUriData.image),
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
