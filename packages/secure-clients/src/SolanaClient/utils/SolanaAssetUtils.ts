import { BACKEND_API_URL } from "@coral-xyz/common";

type GetAssetProofResponse = {
  id: string;
  proof: string[];
  root: string;
};

export async function getAssetProof(
  assetId: string
): Promise<GetAssetProofResponse> {
  const resp = await fetch(`${BACKEND_API_URL}/v2/graphql`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
        query GetAssetProofForNft($assetId: String!) {
          assetProof(assetId: $assetId) {
            id
            proof
            root
          }
        }
      `,
      variables: {
        assetId,
      },
      operationName: "GetAssetProofForNft",
    }),
  });

  const json = await resp.json();
  return json.data.assetProof;
}

export type SolanaAsset =
  | {
      __typename: "Nft";
      mint: string;
      nonFungibleAta: string;
      compressed: boolean;
      compressionData?: {
        creatorHash: string;
        dataHash: string;
        id: string;
        leaf: number;
        tree: string;
      };
      proofData?: {
        id: string;
        proof: string[];
        root: string;
      };
    }
  | {
      __typename: "TokenBalance";
      mint: string;
      fungibleAta: string;
      decimals: number;
    };

export async function getSolanaAssetById(
  assetId: string
): Promise<SolanaAsset> {
  const resp = await fetch(`${BACKEND_API_URL}/v2/graphql`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
        query GetSolanaAssetForId($assetId: ID!, $assetIdStr: String!) {
          assetProof(assetId: $assetIdStr) {
            id
            proof
            root
          }
          node(id: $assetId) {
            __typename

            ... on TokenBalance {
              mint: token
              fungibleAta: address
              decimals
            }

            ... on Nft {
              mint: address
              nonFungibleAta: token
              compressed
              compressionData {
                creatorHash
                dataHash
                id
                leaf
                tree
              }
            }
          }
        }
      `,
      variables: {
        assetId,
        assetIdStr: assetId,
      },
      operationName: "GetSolanaAssetForId",
    }),
  });
  const json = await resp.json();
  return {
    ...json.data?.node,
    proofData: json.data?.assetProof,
  };
}
