import { BACKEND_API_URL } from "@coral-xyz/common";

export type EthereumAsset =
  | {
      __typename: "Nft";
      type: "erc721" | "erc1155";
      contract: { address: string };
      tokenId: string;
    }
  | {
      __typename: "TokenBalance";
      contractAddress: string;
    };

export async function getEthereumAssetById(
  assetId: string
): Promise<EthereumAsset> {
  const resp = await fetch(`${BACKEND_API_URL}/v2/graphql`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
        query GetEthereumAssetForId($assetId: ID!) {
          node(id: $assetId) {
            __typename

            ... on TokenBalance {
              contractAddress: token
            }

            ... on Nft {
              type
              contract: collection {
                address
              }
              tokenId: token
            }
          }
        }
      `,
      variables: {
        assetId,
      },
      operationName: "GetEthereumAssetForId",
    }),
  });
  const json = await resp.json();
  return json.data.node;
}
