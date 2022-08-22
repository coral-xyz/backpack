import { atomFamily, selector, selectorFamily } from "recoil";
import { bootstrap } from "../bootstrap";
import { activeWalletWithData } from "../wallet";

//
// TODO: this doesn't use the metaplex standard. We should use that instead.
//
export const solanaNftCollections = selector({
  key: "solanaNftCollections",
  get: ({ get }: any) => {
    //
    // Get all the collections.
    //
    const { publicKey } = get(activeWalletWithData);
    const metadata = get(solanaNftMetadata(publicKey.toString()));

    //
    // Bucket all the nfts by collection name.
    //
    const collections: Map<string, any> = new Map();
    for (const [key, value] of metadata.entries()) {
      if (value.tokenMetaUriData.collection) {
        const name = value.tokenMetaUriData.collection.name;
        if (!collections.has(name)) {
          collections.set(name, []);
        }
        const values = collections.get(name);
        values.push(value);
        collections.set(name, values);
      }
    }

    //
    // Finally, sort each bucket for consistent UI presentation.
    //
    const sortedCollections: any = [];
    for (const [name, items] of collections.entries()) {
      items.sort((a, b) =>
        a.publicKey > b.publicKey ? 1 : a.publicKey === b.publicKey ? 0 : -1
      );
      sortedCollections.push({ name, items });
    }

    sortedCollections.sort((a, b) =>
      a.name > b.name ? 1 : b.name > a.name ? -1 : 0
    );

    return sortedCollections;
  },
});

/**
 * Full token metadata for all nfts.
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
