import { expect, test } from "vitest";

import { alice, bob, unregistered_user } from "./_constants";

test.todo("creating a user");

test("getting the primary solana public key", async () => {
  expect((await bob.get("users/primarySolPubkey/alice")).publicKey).toEqual(
    alice.public_keys.solana.keys[alice.public_keys.solana.primary]
  );

  expect((await bob.get("users/primarySolPubkey/eth_only")).msg).toEqual(
    "No active pubkey on SOL for this user"
  );
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
