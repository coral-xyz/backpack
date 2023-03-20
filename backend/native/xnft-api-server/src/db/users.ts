import { AVATAR_BASE_URL } from "@coral-xyz/common";
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
  const response = await chain("query")(
    {
      auth_users_by_pk: [
        {
          id,
          where: {
            public_keys: {
              is_primary: true,
            },
          },
        },
        {
          id: true,
          username: true,
          public_keys: [{}, { blockchain: true, public_key: true }],
        },
      ],
    },
    { operationName: "getUser" }
  );
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
    image: `${AVATAR_BASE_URL}/${user.username}`,
  };
};

export const getUserIdFromPubkey = async ({ blockchain, publicKey }) => {
  const { auth_users } = await chain("query")(
    {
      auth_users: [
        {
          limit: 1,
          where: {
            public_keys: {
              is_primary: { _eq: true },
              public_key: { _eq: publicKey },
              blockchain: { _eq: blockchain },
            },
          },
        },
        {
          id: true,
          username: true,
          public_keys: [
            { where: { is_primary: { _eq: true } } },
            { blockchain: true, public_key: true },
          ],
        },
      ],
    },
    { operationName: "getUserIdFromPubkey" }
  );

  return auth_users[0];
};

export const getUserFromUsername = async ({
  username,
}: {
  username: string;
}) => {
  const response = await chain("query")(
    {
      auth_users: [
        {
          limit: 1,
          where: {
            username: { _eq: username },
          },
        },
        {
          id: true,
          username: true,
          public_keys: [{}, { blockchain: true, public_key: true }],
        },
      ],
    },
    { operationName: "getUserFromUsername" }
  );

  const user = response.auth_users[0];
  if (!user) {
    return null;
  }

  const activePubkeys = await chain("query")(
    {
      auth_user_active_publickey_mapping: [
        {
          where: {
            user_id: { _eq: user?.id },
          },
        },
        {
          public_key: {
            public_key: true,
          },
        },
      ],
    },
    { operationName: "getUserFromUsername" }
  );

  const activePubKeyArray: string[] =
    activePubkeys.auth_user_active_publickey_mapping.map(
      (x) => x.public_key.public_key
    );

  const gaurdedUser = {
    ...user,
    public_keys: user.public_keys.filter((x) =>
      activePubKeyArray.includes(x.public_key)
    ),
  };
  return gaurdedUser;
};
