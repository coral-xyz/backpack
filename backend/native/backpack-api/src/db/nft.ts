import { Chain } from "@coral-xyz/zeus";

import { HASURA_URL, JWT } from "../config";

const chain = Chain(HASURA_URL, {
  headers: {
    Authorization: `Bearer ${JWT}`,
  },
});

export const addNfts = async (
  publicKey: string,
  nfts: {
    nftId: string;
    collectionId: string;
  }[]
) => {
  await chain("mutation")({
    insert_auth_user_nfts: [
      {
        objects: nfts.map((nft) => ({
          collection_id: nft.collectionId,
          nft_id: nft.nftId,
          public_key: publicKey,
        })),
      },
      { affected_rows: true },
    ],
  }).catch((e) => {});
};

export const validateCollectionOwnership = async (
  uuid: string,
  publicKey: string,
  mint: string,
  collection: string
): Promise<boolean> => {
  console.log("mint");
  console.log(mint);
  console.log(collection);
  const response = await chain("query")({
    auth_public_keys: [
      {
        where: {
          public_key: { _eq: publicKey },
        },
        limit: 100,
      },
      {
        user_id: true,
      },
    ],
  });

  if (response.auth_public_keys[0]?.user_id !== uuid) {
    return false;
  }

  const returnedCollection = await getNftCollection({ mint, publicKey });

  return returnedCollection === collection;
};

export const getNftCollection = async ({
  mint,
  publicKey,
}: {
  mint: string;
  publicKey: string;
}) => {
  const response = await chain("query")({
    auth_user_nfts_by_pk: [
      {
        nft_id: mint,
        public_key: publicKey,
      },
      {
        collection_id: true,
      },
    ],
  });
  return response.auth_user_nfts_by_pk?.collection_id || "";
};
