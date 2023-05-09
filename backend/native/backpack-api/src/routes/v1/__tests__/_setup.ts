import { beforeAll, expect } from "vitest";

import { Chain } from "../../../../../zeus/dist/esm";
import { HASURA_URL, JWT } from "../../../config";

import { users } from "./_constants";

if (process.env.NODE_ENV !== "test" || !HASURA_URL.includes("localhost:")) {
  console.error("This is not a test environment");
  process.exit(1);
}

expect.extend({
  toOnlyIncludePrimaryPublicKeysFor(
    keys,
    user: (typeof users)[keyof typeof users]
  ) {
    const { isNot } = this;
    const primaryKeys = Object.entries(user.public_keys).reduce(
      (acc, [chain, { keys, primary }]) => {
        acc[chain] = keys[primary];
        return acc;
      },
      {}
    );
    return {
      pass:
        Object.keys(primaryKeys).length === keys.length &&
        keys.every(
          (key) =>
            ((key.public_key || key.publicKey) &&
              primaryKeys[key.blockchain] === key.public_key) ||
            key.publicKey
        ),
      message: () =>
        `${
          isNot ? "only includes" : "includes hidden and"
        } primary public keys`,
    };
  },
  toIncludeHiddenNonPrimaryPublicKeysFor(
    keys,
    user: (typeof users)[keyof typeof users]
  ) {
    const { isNot } = this;
    const allKeysLength = Object.values(user.public_keys).reduce(
      (acc, { keys }) => acc + keys.length,
      0
    );
    return {
      pass:
        allKeysLength === keys.length &&
        keys.every(
          (key) =>
            (key.public_key || key.publicKey) &&
            user.public_keys[key.blockchain].keys.includes(
              key.public_key || key.publicKey
            )
        ),
      message: () =>
        `${
          isNot ? "does not include non-primary" : "includes non-primary"
        } public keys`,
    };
  },
});

beforeAll(async () => {
  const LOCAL_ADMIN_PASSWORD = "myadminsecretkey";
  await fetch(HASURA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": LOCAL_ADMIN_PASSWORD,
    },
    body: JSON.stringify({
      // TODO: add DELETE cascades to remove all associated data with users
      query: `mutation {
        delete_auth_friendships(where: {}) { affected_rows }
        delete_auth_friend_requests(where: {}) { affected_rows }
        delete_auth_user_active_publickey_mapping(where: {}) { affected_rows }
        delete_auth_public_keys(where: {}) { affected_rows }
        delete_auth_users(where: {}) { affected_rows }
        delete_auth_invitations(where: {}) { affected_rows }
      }`,
    }),
  });

  const chain = Chain(HASURA_URL, {
    headers: { Authorization: `Bearer ${JWT}` },
  });
  await chain("mutation")({
    insert_auth_invitations: [
      {
        objects: Object.values(users)
          .filter(({ id }) => id)
          .map((user) => ({ id: user.id })),
      },
      { affected_rows: true },
    ],
  });
  await chain("mutation")({
    insert_auth_users: [
      {
        objects: Object.entries(users)
          .filter(([_, { id }]) => id)
          .map(([username, user]) => ({
            id: user.id,
            username,
            invitation_id: user.id,
            public_keys: {
              data: Object.entries(user.public_keys).reduce(
                (acc, [blockchain, { primary, keys }]) => {
                  keys.forEach((key, i) => {
                    acc.push({
                      blockchain,
                      public_key: key,
                      user_active_publickey_mappings: {
                        data:
                          i === primary
                            ? [
                                {
                                  user_id: user.id,
                                  blockchain,
                                },
                              ]
                            : [],
                      },
                    });
                  });
                  return acc;
                },
                [] as any[]
              ),
            },
          })),
      },
      { affected_rows: true },
    ],
  });
});
