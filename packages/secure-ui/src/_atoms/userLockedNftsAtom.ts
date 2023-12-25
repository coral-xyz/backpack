import { BACKEND_API_URL } from "@coral-xyz/common";
import { solanaClientAtom, secureUserAtom } from "@coral-xyz/recoil";
import { atomFamily, selector, selectorFamily } from "recoil";

export type GetCollectionNftForWalletResponse = {
  collection: {
    id: string;
    address: string;
    name: string;
  };
  image: string;
  name: string;
  token: string;
}[];
async function getCollectionNFTs(
  wallet: string,
  collection: string
): Promise<GetCollectionNftForWalletResponse> {
  const resp = await fetch(`${BACKEND_API_URL}/v2/graphql`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
        query GetCollectionNftForWallet(
          $wallet: String!, 
          $providerId: ProviderID!, 
          $collection: String!
        ) {
          wallet(
            address: $wallet, 
            providerId: $providerId, 
          ) {
            id
            nfts(filters: { collection: $collection }) {
              edges {
                node {
                  collection {
                    id
                    address
                    name
                  }
                  image
                  name
                  token
                }
              }
            }
          }
        }
      `,
      variables: {
        wallet,
        providerId: "SOLANA",
        collection,
      },
      operationName: "GetCollectionNftForWallet",
    }),
  });
  const json = await resp.json();
  return json.data?.wallet?.nfts?.edges?.map((node) => node.node) ?? [];
}

export const userLockedNftsAtom = selectorFamily<
  GetCollectionNftForWalletResponse,
  string
>({
  key: "userLockedNftsAtom",
  get:
    (publicKey) =>
    async ({ get }) => {
      const user = get(secureUserAtom);
      const lockedCollections: string[] =
        user.preferences.lockedCollections ?? [];
      if (lockedCollections.length <= 0) {
        return [];
      }
      const lockedNfts = await Promise.all(
        lockedCollections.map((collection) =>
          getCollectionNFTs(publicKey, collection)
        )
      );
      return lockedNfts.flat();
    },
});
