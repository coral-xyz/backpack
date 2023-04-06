import { expect, test } from "vitest";

import { alice, bob } from "./_constants";

test("adding a friend", async () => {
  expect((await alice.get("friends/sent")).requests).toEqual([]);
  expect((await bob.get("friends/requests")).requests).toEqual([]);

  expect((await alice.get(`friends?userId=${bob.id}`)).are_friends).toBeFalsy();
  expect((await bob.get(`friends?userId=${alice.id}`)).are_friends).toBeFalsy();

  await alice.post("friends/request", { to: bob.id, sendRequest: true });

  expect((await alice.get("friends/sent")).requests).toMatchObject([
    {
      username: "bob",
      areFriends: false,
      requested: true,
      remoteRequested: false,
    },
  ]);

  expect((await bob.get("friends/requests")).requests).toMatchObject([
    {
      username: "alice",
      areFriends: false,
      requested: false,
      remoteRequested: true,
    },
  ]);

  await bob.post("friends/request", { to: alice.id, sendRequest: true });

  expect(
    (await alice.get(`friends?userId=${bob.id}`)).are_friends
  ).toBeTruthy();
  expect(
    (await bob.get(`friends?userId=${alice.id}`)).are_friends
  ).toBeTruthy();

  expect((await alice.post("inbox", { to: bob.id })).areFriends).toBeTruthy();
  expect((await bob.post("inbox", { to: alice.id })).areFriends).toBeTruthy();
});
