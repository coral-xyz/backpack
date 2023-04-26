import type { Blockchain } from "@coral-xyz/common";
import { AVATAR_BASE_URL } from "@coral-xyz/common";
import { Chain } from "@coral-xyz/zeus";
import { v4 as uuidv4 } from "uuid";

import { HASURA_URL, JWT } from "../config";

import { updatePublicKey } from "./publicKey";

const chain = Chain(HASURA_URL, {
  headers: {
    Authorization: `Bearer ${JWT}`,
  },
});

export const getUsersMetadata = async (
  userIds: string[]
): Promise<
  {
    username: unknown;
    id: unknown;
  }[]
> => {
  // hotfix: empty array returns all records
  if (userIds.filter(Boolean).length === 0) return [];

  const response = await chain("query")(
    {
      auth_users: [
        {
          where: { id: { _in: userIds } },
        },
        {
          id: true,
          username: true,
        },
      ],
    },
    { operationName: "getUsersMetadata" }
  );
  return response.auth_users.map((x) => ({
    username: x.username,
    id: x.id,
  }));
};

export const getUsers = async (
  userIds: string[]
): Promise<
  {
    username: unknown;
    id: unknown;
    publicKeys: unknown[];
  }[]
> => {
  // hotfix: empty array returns all records
  if (userIds.filter(Boolean).length === 0) return [];

  const { auth_users } = await chain("query")(
    {
      auth_users: [
        {
          where: {
            id: { _in: userIds },
            public_keys: { is_primary: { _eq: true } },
          },
        },
        {
          id: true,
          username: true,
          public_keys: [
            {
              where: { is_primary: { _eq: true } },
            },
            {
              public_key: true,
              id: true,
              blockchain: true,
              is_primary: true,
            },
          ],
        },
      ],
    },
    { operationName: "getUsers" }
  );

  return auth_users.map((x) => transformUser(x, true));
};

/**
 * Look up user IDs for multiple blockchain/public key pairs.
 */
export const getUsersByPublicKeys = async (
  blockchainPublicKeys: Array<{ blockchain: Blockchain; publicKey: string }>
): Promise<
  Array<{ user_id?: unknown; blockchain: string; public_key: unknown }>
> => {
  const response = await chain("query")(
    {
      auth_public_keys: [
        {
          where: {
            // Only matching public keys here, but it should be checking
            // blockchain AND public key as the same public key will be used
            // for different blockchains (particularly EVM)
            public_key: { _in: blockchainPublicKeys.map((b) => b.publicKey) },
          },
          limit: 100,
        },
        {
          user_id: true,
          public_key: true,
          blockchain: true,
        },
      ],
    },
    { operationName: "getUsersByPublicKeys" }
  );

  // Filter again to make sure the blockchain/public key pair match. It might
  // be possible to do this in graphql query?
  const result = response.auth_public_keys.filter((r) => {
    return blockchainPublicKeys.some(
      (b) =>
        b.publicKey === r.public_key &&
        (b.blockchain as Blockchain) === r.blockchain
    );
  });

  return result;
};

/**
 * Get a user by their username.
 */
export const getUserByUsername = async (username: string) => {
  const { auth_users } = await chain("query")(
    {
      auth_users: [
        {
          limit: 1,
          where: {
            username: { _eq: username },
            public_keys: { is_primary: { _eq: true } },
          },
        },
        {
          id: true,
          username: true,
          public_keys: [
            { where: { is_primary: { _eq: true } } },
            {
              id: true,
              blockchain: true,
              public_key: true,
              is_primary: true,
            },
          ],
        },
      ],
    },
    { operationName: "getUserByUsername" }
  );
  if (!auth_users[0]) {
    throw new Error("user not found");
  }
  return transformUser(auth_users[0], true);
};

/**
 * Get a user by their id.
 */
export const getUser = async (id: string, onlyActiveKeys?: boolean) => {
  const response = await chain("query")(
    {
      auth_users_by_pk: [
        {
          id,
        },
        {
          id: true,
          username: true,
          public_keys: [
            {},
            {
              blockchain: true,
              id: true,
              public_key: true,
              is_primary: true,
            },
          ],
        },
      ],
    },
    { operationName: "getUser" }
  );
  if (!response.auth_users_by_pk) {
    throw new Error("user not found");
  }
  return transformUser(response.auth_users_by_pk, onlyActiveKeys);
};

export const getReferrer = async (userId: string) => {
  const { auth_users_by_pk } = await chain("query")(
    {
      auth_users_by_pk: [
        {
          id: userId,
        },
        {
          referrer: {
            id: true,
            username: true,
          },
        },
      ],
    },
    { operationName: "getReferrer" }
  );
  return auth_users_by_pk?.referrer;
};

/**
 * Utility method to format a user for responses from a raw user object.
 */
const transformUser = (
  user: {
    id: unknown;
    username: unknown;
    public_keys: Array<{
      blockchain: string;
      public_key: string;
      is_primary?: boolean;
    }>;
  },
  onlyActiveKeys?: boolean
) => {
  return {
    id: user.id,
    username: user.username,
    // Camelcase public keys for response
    publicKeys: user.public_keys
      .map((k) => ({
        blockchain: k.blockchain as Blockchain,
        publicKey: k.public_key,
        primary: Boolean(k.is_primary),
      }))
      .filter((x) => {
        if (onlyActiveKeys && !x.primary) {
          return false;
        }
        return true;
      }),
    image: `${AVATAR_BASE_URL}/${user.username}`,
  };
};

/**
 * Create a user
 */
export const createUser = async (
  username: string,
  blockchainPublicKeys: Array<{ blockchain: Blockchain; publicKey: string }>,
  waitlistId?: string | null,
  referrerId?: string
): Promise<{
  id: string;
  username: string;
  public_keys: { blockchain: "solana" | "ethereum"; id: number }[];
}> => {
  const inviteCode = uuidv4();
  await chain("mutation")(
    {
      insert_auth_invitations_one: [
        {
          object: {
            id: inviteCode,
          },
        },
        {
          id: true,
        },
      ],
    },
    { operationName: "createUser" }
  );

  const response = await chain("mutation")(
    {
      insert_auth_users_one: [
        {
          object: {
            username: username,
            public_keys: {
              data: blockchainPublicKeys.map((b) => ({
                blockchain: b.blockchain,
                public_key: b.publicKey,
              })),
            },
            invitation_id: inviteCode,
            waitlist_id: waitlistId,
            referrer_id: referrerId,
          },
        },
        {
          id: true,
          username: true,
          public_keys: [
            {},
            {
              blockchain: true,
              id: true,
              public_key: true,
              user_active_publickey_mappings: [{}, { user_id: true }],
            },
          ],
        },
      ],
    },
    { operationName: "createUser" }
  );

  // @ts-ignore
  return response.insert_auth_users_one;
};

/**
 * Search for users by prefix.
 */
export async function getUsersByPrefix({
  usernamePrefix,
  uuid,
  limit = 25,
}: {
  usernamePrefix: string;
  uuid: string;
  limit?: number;
}) {
  const { auth_users_whose_username_matches: users } = await chain("query")(
    {
      auth_users_whose_username_matches: [
        {
          args: {
            prefix: usernamePrefix,
          },
          where: {
            id: { _neq: uuid },
            public_keys: { is_primary: { _eq: true } },
          },
          limit,
        },
        {
          id: true,
          username: true,
          public_keys: [
            { where: { is_primary: { _eq: true } } },
            {
              blockchain: true,
              public_key: true,
            },
          ],
        },
      ],
    },
    { operationName: "getUsersByPrefix" }
  );

  return users;
}

/**
 * Delete a public key/blockchain from a user.
 */

export async function deleteUserPublicKey({
  userId,
  blockchain,
  publicKey,
}: {
  userId: string;
  blockchain: Blockchain;
  publicKey: string;
}) {
  const response = await chain("mutation")(
    {
      delete_auth_public_keys: [
        {
          where: {
            user_id: { _eq: userId },
            blockchain: { _eq: blockchain },
            public_key: { _eq: publicKey },
          },
        },
        {
          affected_rows: true,
        },
      ],
    },
    { operationName: "deleteUserPublicKey" }
  );

  return response.delete_auth_public_keys;
}

/**
 * Add a public key/blockchain to a user.
 */
export async function createUserPublicKey({
  userId,
  blockchain,
  publicKey,
}: {
  userId: string;
  blockchain: Blockchain;
  publicKey: string;
}): Promise<{ isPrimary: boolean }> {
  const response = await chain("mutation")(
    {
      insert_auth_public_keys_one: [
        {
          object: {
            user_id: userId,
            blockchain: blockchain as string,
            public_key: publicKey,
          },
        },
        {
          id: true,
        },
      ],
    },
    { operationName: "createUserPublicKey" }
  );

  const publicKeyId = response.insert_auth_public_keys_one?.id;
  if (publicKeyId) {
    const updatedPublicKey = await updatePublicKey({
      userId: userId,
      blockchain: blockchain,
      publicKeyId,
      onlyInsert: true,
    });

    if (updatedPublicKey === publicKeyId) {
      return { isPrimary: true };
    }
    return { isPrimary: false };
  }
  return { isPrimary: false };
}

/**
 * Update avatar_nft of a user.
 */
export async function updateUserAvatar({
  userId,
  avatar,
}: {
  userId: string;
  avatar: string | null;
}) {
  const response = await chain("mutation")(
    {
      update_auth_users: [
        {
          where: {
            id: { _eq: userId },
          },
          _set: {
            avatar_nft: avatar,
          },
        },
        {
          affected_rows: true,
        },
      ],
    },
    { operationName: "updateUserAvatar" }
  );

  return response.update_auth_users;
}

export const getUserByPublicKeyAndChain = async (
  publicKey: string,
  blockchain: Blockchain
) => {
  const response = await chain("query")(
    {
      auth_users: [
        {
          where: {
            public_keys: {
              blockchain: { _eq: blockchain },
              public_key: { _eq: publicKey },
              is_primary: { _eq: true },
            },
          },
        },
        {
          id: true,
          username: true,
          public_keys: [
            { where: { is_primary: { _eq: true } } },
            {
              blockchain: true,
              public_key: true,
            },
          ],
        },
      ],
    },
    { operationName: "getUserByPublicKeyAndChain" }
  );

  return response.auth_users || [];
};
