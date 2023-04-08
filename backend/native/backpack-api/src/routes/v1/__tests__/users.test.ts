import { describe, expect, test } from "vitest";

import { alice, bob, unregistered_user } from "./_constants";

test.todo("creating a user");

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
  const res = await unregistered_user.get("users/alice");
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
  const res = await unregistered_user.get(`users/me`);
  expect(res.id).toBeFalsy();
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
