import { v4 } from "uuid";
import { afterEach, describe, expect, test } from "vitest";

import { Chain } from "../../../../../zeus/dist/esm";
import { HASURA_URL } from "../../../config";

import { ali, alice, bob, get } from "./_constants";

describe.todo("creating a user", () => {
  test.todo("with valid credentials");
  test.todo("with invalid credentials");
  test.todo("with a referrer cookie");
  test.todo("sets the authenticated user as the referrer if there's no cookie");
});

describe("getting the primary solana public key", async () => {
  test("for a user with a primary solana public key", async () => {
    expect((await bob.get("users/primarySolPubkey/alice")).publicKey).toEqual(
      alice.public_keys.solana.keys[alice.public_keys.solana.primary]
    );
  });

  test("for a user that doesn't have a primary solana public key", async () => {
    expect((await bob.get("users/primarySolPubkey/ali")).msg).toEqual(
      "No active pubkey on SOL for this user"
    );
  });
});

test("getting a user", async () => {
  const res = await get("users/alice");
  expect(res.id).toEqual(alice.id);
  expect(res.publicKeys).toOnlyIncludePrimaryPublicKeysFor(alice);
});

test("getting a user by their ID", async () => {
  const res = await bob.get(`users/userById?remoteUserId=${alice.id}`);
  expect(res.user.username).toEqual("alice");
  expect(res.user.publicKeys).toOnlyIncludePrimaryPublicKeysFor(alice);
});

test("a registered user can get information about themselves", async () => {
  const res = await alice.get(`users/me`);
  expect(res.id).toEqual(alice.id);
  expect(res.publicKeys).toIncludeHiddenNonPrimaryPublicKeysFor(alice);
});

test("an unregistered user cannot get information about themselves", async () => {
  const res = await get(`users/me`);
  expect(res.id).toBeFalsy();
});

describe("updating the referrer", async () => {
  const chain = await Chain(HASURA_URL, {
    headers: { "x-hasura-admin-secret": "myadminsecretkey" },
  });

  test("a user's referrer is set if they have a valid referrer cookie", async () => {
    let res = await get(`users/me`, undefined, {
      Cookie: `jwt=${alice.jwt};referrer=${bob.id};`,
    });
    expect(await getReferrersUsername(alice)).toBe("bob");
    expect(res.id).toEqual(alice.id);

    // ... and it won't be changed once it's set

    res = await get(`users/me`, undefined, {
      Cookie: `jwt=${alice.jwt};referrer=${ali.id};`,
    });
    expect(await getReferrersUsername(alice)).toBe("bob");
    expect(res.id).toEqual(alice.id);
  });

  test("a user doesn't get a referrer if there's no referrer cookie set", async () => {
    expect(await getReferrersUsername(alice)).toBeUndefined();
    const res = await alice.get(`users/me`);
    expect(await getReferrersUsername(alice)).toBeUndefined();
    expect(res.id).toEqual(alice.id);
  });

  for (const referrer of [v4(), "invalid", "", alice.id]) {
    test(`invalid referrer ('${referrer}') is ignored`, async () => {
      const res = await get(`users/me`, undefined, {
        Cookie: `jwt=${alice.jwt};referrer=${referrer};`,
      });
      expect(await getReferrersUsername(alice)).toBeUndefined();
      expect(res.id).toEqual(alice.id);
    });
  }

  afterEach(async () => {
    await chain("mutation")(
      {
        update_auth_users_many: [
          { updates: [{ where: {}, _set: { referrer_id: null } }] },
          { affected_rows: true },
        ],
      },
      { operationName: "clearReferrers" }
    );
  });

  async function getReferrersUsername(user: any) {
    const { auth_users_by_pk } = await chain("query")(
      {
        auth_users_by_pk: [{ id: user.id }, { referrer: { username: true } }],
      },
      { operationName: "getReferrer" }
    );
    return auth_users_by_pk?.referrer?.username;
  }
});

test("getting users via prefix", async () => {
  const res = await bob.get(`users?usernamePrefix=ali`);
  expect(res.users.map((u) => u.username)).toStrictEqual(["ali", "alice"]);

  const { public_keys } = res.users[1];
  expect(public_keys).toOnlyIncludePrimaryPublicKeysFor(alice);

  // Temporary, see https://github.com/coral-xyz/backpack/issues/3645
  expect(public_keys.map((x) => x.public_key)).toStrictEqual(
    public_keys.map((x) => x.publicKey)
  );
});
