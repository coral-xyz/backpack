import { atomFamily, selector, selectorFamily } from "recoil";
import {
  externalResourceUri,
  Blockchain,
  NftCollection,
  SolanaNft,
} from "@coral-xyz/common";
import { bootstrap } from "../bootstrap";
import { activeSolanaWallet } from "../wallet";

export const solanaNftCollections = selector<NftCollection[]>({
  key: "solanaNftCollections",
  get: ({ get }: any) => {
    //
    // Get all the collections.
    //
    const wallet = get(activeSolanaWallet);
    if (!wallet) return [];
    const metadata = get(solanaNftMetadata(wallet.publicKey.toString()));

    //
    // Bucket all the nfts by collection name.
    //
    const collections: Map<string, any> = new Map();
    for (const value of metadata.values()) {
      let [collectionId, collection] = (() => {
        // TODO: figure out a better way to group collections, e.g. a whitelist by creator?
        if (value.tokenMetaUriData.collection) {
          const collectionId = value.tokenMetaUriData.collection.name;
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
          items: [],
        });
      }
      collections.get(collectionId).items.push({
        blockchain: Blockchain.SOLANA,
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
      } as SolanaNft);
    }

    //
    // Sort for consistent UI presentation.
    //
    return [...collections.values()]
      .sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0))
      .map((c) => {
        return {
          ...c,
          items: c.items.sort((a: SolanaNft, b: SolanaNft) =>
            a.id > b.id ? 1 : b.id > a.id ? -1 : 0
          ),
        };
      });
  },
});

/**
 * Token metadata for Solana NFTs.
 *
 * Note that it's important for this to be an atomFamily keyed on wallet pubkey
 * so that when the wallet changes, we automatically refresh the state.
 */
export const solanaNftMetadata = atomFamily<Map<string, any>, string>({
  key: "solanaNftMap",
  default: selectorFamily({
    key: "solanaNftMapDefault",
    get:
      (walletPubkey: string) =>
      ({ get }: any) => {
        const b = get(bootstrap);
        return new Map(b.splNftMetadata);
      },
  }),
});
