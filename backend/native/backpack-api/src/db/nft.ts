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
    centralizedGroup: string;
  }[]
) => {
  await chain("mutation")(
    {
      insert_auth_user_nfts: [
        {
          objects: nfts.map((nft) => ({
            collection_id: nft.collectionId,
            nft_id: nft.nftId,
            public_key: publicKey,
            centralized_group: nft.centralizedGroup,
          })),
        },
        { affected_rows: true },
      ],
    },
    { operationName: "addNfts" }
  ).catch(() => {});
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

export const validatePublicKeyOwnership = async (
  uuid: string,
  publicKey: string
) => {
  const response = await chain("query")(
    {
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
    },
    { operationName: "validatePublicKeyOwnership" }
  );

  if (response.auth_public_keys[0]?.user_id !== uuid) {
    return false;
  }
  return true;
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

export const getNftCollectionByGroupName = async ({
  uuid,
  centralizedGroup,
}: {
  uuid: string;
  centralizedGroup?: string;
}) => {
  const response = await chain("query")(
    {
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
    },
    { operationName: "getNftCollectionByGroupName" }
  );
  return response.auth_user_nfts[0]?.collection_id || "";
};

export const getNftCollection = async ({
  mint,
  publicKey,
  centralizedGroup,
}: {
  mint: string;
  publicKey: string;
  centralizedGroup?: string;
}) => {
  const response = await chain("query")(
    {
      auth_user_nfts_by_pk: [
        {
          nft_id: mint,
          public_key: publicKey,
          centralized_group: centralizedGroup,
        },
        {
          collection_id: true,
        },
      ],
    },
    { operationName: "getNftCollection" }
  );
  return response.auth_user_nfts_by_pk?.collection_id || "";
};

export const getAllUsers = async (
  prefix: string,
  limit: number,
  offset: number
) => {
  const response = await chain("query")(
    {
      auth_users_whose_username_matches: [
        {
          args: { prefix },
          limit,
          offset: limit * offset,
        },
        {
          id: true,
          username: true,
        },
      ],
      auth_users_aggregate: [
        {},
        {
          aggregate: {
            count: [{}, true],
          },
        },
      ],
    },
    // eslint-disable-next-line zeus-custom/require-operation-name
    { operationName: "getAllUsersWith30sCache @cached(ttl: 30)" }
  );
  return {
    users:
      response.auth_users_whose_username_matches.map((x) => ({
        id: String(x?.id || ""),
        username: String(x?.username || ""),
      })) || [],
    count: response.auth_users_aggregate.aggregate?.count || 0,
  };
};

export const getNftMembers = async (
  collectionId: string,
  prefix: string,
  limit: number,
  offset: number
): Promise<{ users: { id: string; username: string }[]; count: number }> => {
  const response = await chain("query")(
    {
      auth_users_whose_username_matches: [
        {
          args: { prefix },
          where: {
            public_keys: {
              user_nfts: {
                _or: [
                  { collection_id: { _eq: collectionId } },
                  { centralized_group: { _eq: collectionId } },
                ],
              },
            },
          },
          limit,
          offset: limit * offset,
        },
        {
          id: true,
          username: true,
        },
      ],
      auth_users_aggregate: [
        {
          where: {
            public_keys: {
              user_nfts: {
                _or: [
                  { collection_id: { _eq: collectionId } },
                  { centralized_group: { _eq: collectionId } },
                ],
              },
            },
          },
        },
        {
          aggregate: {
            count: [{}, true],
          },
        },
      ],
    },
    // eslint-disable-next-line zeus-custom/require-operation-name
    { operationName: "getNftMembersWith30sCache @cached(ttl: 30)" }
  );
  return {
    users:
      response.auth_users_whose_username_matches?.map((x) => ({
        id: String(x?.id || ""),
        username: String(x?.username || ""),
      })) || [],
    count: response.auth_users_aggregate?.aggregate?.count || 0,
  };
};

export const getAllCollectionsFor = async (
  uuid: string
): Promise<{ collection_id: string; centralized_group?: string }[]> => {
  const response = await chain("query")(
    {
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
          },
        },
        {
          collection_id: true,
          centralized_group: true,
        },
      ],
    },
    { operationName: "getAllCollectionsFor" }
  );
  return response.auth_user_nfts.map((x) => ({
    collection_id: x.collection_id || "",
    centralized_group: x.centralized_group,
  }));
};

export const getLastReadFor = async (
  uuid: string,
  collectionIds: string[]
): Promise<{ collection_id: string; last_read_message_id: string }[]> => {
  const response = await chain("query")(
    {
      auth_collection_messages: [
        {
          where: {
            uuid: { _eq: uuid },
            collection_id: { _in: collectionIds },
          },
        },
        {
          collection_id: true,
          last_read_message_id: true,
        },
      ],
    },
    { operationName: "getLastReadFor" }
  );
  return response.auth_collection_messages.map((x) => ({
    last_read_message_id: x.last_read_message_id || "",
    collection_id: x.collection_id || "",
  }));
};

export const getCollectionChatMetadata = async (
  collectionIds: string[]
): Promise<
  {
    collection_id: string;
    last_message: string;
    last_message_uuid: string;
    last_message_timestamp: string;
  }[]
> => {
  const response = await chain("query")(
    {
      auth_collections: [
        {
          where: {
            collection_id: { _in: collectionIds },
          },
        },
        {
          collection_id: true,
          last_message: true,
          last_message_uuid: true,
          last_message_timestamp: true,
        },
      ],
    },
    { operationName: "getCollectionChatMetadata" }
  );
  return response.auth_collections.map((x) => ({
    collection_id: x.collection_id || "",
    last_message: x.last_message || "",
    last_message_uuid: x.last_message_uuid || "",
    last_message_timestamp: x.last_message_timestamp || "",
  }));
};
