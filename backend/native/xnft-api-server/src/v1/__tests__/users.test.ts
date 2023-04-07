import { describe, expect, test } from "vitest";

import {
  alice,
  bob,
} from "../../../../backpack-api/src/routes/v1/__tests__/_constants";

describe("getting a user with a public key", () => {
  const keys = [...alice.public_keys.solana.keys];
  const primaryKey = keys.splice(alice.public_keys.solana.primary, 1)[0];

  test("using a primary public key", async () => {
    const res = await bob.get(
      `v1/users/fromPubkey?publicKey=${primaryKey}&blockchain=solana`
    );
    expect(res.user.username).toEqual("alice");
    expect(res.user.public_keys).toOnlyIncludePrimaryPublicKeysFor(alice);
  });

  test("using a hidden public key", async () => {
    expect(
      (
        await alice.get(
          `v1/users/fromPubkey?publicKey=${keys[0]}&blockchain=solana`
        )
      ).msg
    ).toMatch(/not found/i);
  });
});

test("getting a user with an id", async () => {
  const res = await bob.get(`v1/users?user_id=${alice.id}`);
  expect(res.user.username).toEqual("alice");
  expect(res.user.publicKeys).toOnlyIncludePrimaryPublicKeysFor(alice);
});

test("getting a user with a username", async () => {
  const res = await bob.get(`v1/users/fromUsername?username=alice`);
  expect(res.user.id).toEqual(alice.id);
  expect(res.user.public_keys).toOnlyIncludePrimaryPublicKeysFor(alice);
});
