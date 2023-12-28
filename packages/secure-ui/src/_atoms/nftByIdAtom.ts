import { BACKEND_API_URL } from "@coral-xyz/common";
import { selectorFamily } from "recoil";

type GetAssetResponse = {
  name: string;
  image: string;
};
async function getAssetById(assetId: string): Promise<GetAssetResponse> {
  const resp = await fetch(`${BACKEND_API_URL}/v2/graphql`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
        query GetAssetForId($assetId: ID!) {
          node(id: $assetId) {
            ... on Nft {
              name
              image
            }
          }
        }
      `,
      variables: {
        assetId,
      },
      operationName: "GetAssetForId",
    }),
  });

  const json = await resp.json();
  return json.data.node;
}

// additional Atom to trigger rerender when event is switched to responded
export const assetByIdAtom = selectorFamily<
  {
    image: string;
    name: string;
  },
  string
>({
  key: "assetByIdAtom",
  get:
    (assetId) =>
    async ({ get }) => {
      const asset = await getAssetById(assetId);
      return asset;
    },
});
