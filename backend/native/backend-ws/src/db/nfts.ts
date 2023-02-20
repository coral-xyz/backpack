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
        centralized_group: true,
      },
    ],
  });

  return response.auth_user_nfts.map(
    (x) => x.centralized_group || x.collection_id || ""
  );
};

export const getNftCollectionByGroupName = async ({
  uuid,
  centralizedGroup,
}: {
  uuid: string;
  centralizedGroup?: string;
}) => {
  const response = await chain("query")({
    auth_user_nfts: [
      {
        where: {
          publicKeyByBlockchainPublicKey: {
            user: {
              id: {
                _eq: uuid,
              },
            },
          },
          _or: [
            {
              centralized_group: { _eq: centralizedGroup },
            },
            {
              collection_id: { _eq: centralizedGroup },
            },
          ],
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
  centralizedGroup: string
) => {
  const returnedCollection = await getNftCollectionByGroupName({
    centralizedGroup,
    uuid,
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
  collection: string
): Promise<boolean> => {
  const returnedCollection = await getNftCollectionByGroupName({
    centralizedGroup: collection,
    uuid,
  });

  return returnedCollection ? true : false;
};
