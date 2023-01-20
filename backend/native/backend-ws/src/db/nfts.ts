import { Chain } from "@coral-xyz/zeus";

import { AUTH_HASURA_URL, AUTH_JWT } from "../config";

import { getPublicKeys } from "./publicKeys";

const chain = Chain(AUTH_HASURA_URL, {
  headers: {
    Authorization: `Bearer ${AUTH_JWT}`,
  },
});

export const getNftCollections = async (uuid: string): Promise<string[]> => {
  const publicKeys = await getPublicKeys(uuid);
  const response = await chain("query")({
    auth_user_nfts: [
      {
        where: {
          public_key: { _in: publicKeys },
        },
        limit: 100,
      },
      {
        collection_id: true,
      },
    ],
  });

  return response.auth_user_nfts.map((x) => x.collection_id || "");
};

export const getNftCollectionByGroupName = async ({
  publicKey,
  centralizedGroup,
}: {
  publicKey: string;
  centralizedGroup?: string;
}) => {
  const response = await chain("query")({
    auth_user_nfts: [
      {
        where: {
          public_key: { _eq: publicKey },
          centralized_group: { _eq: centralizedGroup },
        },
      },
      {
        collection_id: true,
      },
    ],
  });
  return response.auth_user_nfts[0]?.collection_id || "";
};

export const validateCentralizedGroupOwnership = async (
  uuid: string,
  publicKey: string,
  centralizedGroup: string
) => {
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

  const returnedCollection = await getNftCollectionByGroupName({
    centralizedGroup,
    publicKey,
  });

  return returnedCollection;
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

export const validateCollectionOwnership = async (
  uuid: string,
  publicKey: string,
  mint: string,
  collection: string
): Promise<boolean> => {
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
