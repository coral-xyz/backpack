import { Chain } from "@coral-xyz/zeus";

import { HASURA_URL, JWT } from "../config";

const chain = Chain(HASURA_URL, {
  headers: {
    Authorization: `Bearer ${JWT}`,
  },
});

/**
 * Get a user by their id.
 */
export const getUser = async (id: string) => {
  const response = await chain("query")({
    auth_users_by_pk: [
      {
        id,
      },
      {
        id: true,
        username: true,
        public_keys: [{}, { blockchain: true, public_key: true }],
      },
    ],
  });
  if (!response.auth_users_by_pk) {
    throw new Error("user not found");
  }
  return transformUser(response.auth_users_by_pk);
};

/**
 * Utility method to format a user for responses from a raw user object.
 */
const transformUser = (user: {
  id: unknown;
  username: unknown;
  public_keys: Array<{ blockchain: string; public_key: string }>;
}) => {
  return {
    id: user.id,
    username: user.username,
    // Camelcase public keys for response
    publicKeys: user.public_keys.map((k) => ({
      blockchain: k.blockchain,
      publicKey: k.public_key,
    })),
    image: `https://avatars.xnfts.dev/v1/${user.username}`,
  };
};

export const getUserIdFromPubkey = async ({ blockchain, publicKey }) => {
  const response = await chain("query")({
    auth_users: [
      {
        where: {
          public_keys: {
            public_key: { _eq: publicKey },
            blockchain: { _eq: blockchain },
          },
        },
      },
      {
        id: true,
        username: true,
        public_keys: [{}, { blockchain: true, public_key: true }],
      },
    ],
  });

  return response.auth_users[0] ?? null;
};
