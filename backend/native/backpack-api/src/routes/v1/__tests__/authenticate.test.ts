import { decodeJwt } from "jose";
import { expect, test } from "vitest";

import { alice, API_URL } from "./_constants";

test("authenticate with solana", async () => {
  const res = await fetch(`${API_URL}/authenticate`, {
    headers: {
      "content-type": "application/json",
    },
    method: "post",
    body: JSON.stringify({
      blockchain: "solana",
      publicKey:
        alice.public_keys.solana.keys[alice.public_keys.solana.primary],
      message:
        "4cP2Yu38KqhPTXvB76F1BTruaFH2YEgskkRWbF9Gexh2qZvNv7oaatjVGcCdgkSbiWvWLY", // Backpack login ${alice.id}
      signature:
        "419pZ7qXoMQQKUv5pZKCK581U6Jph225HcDzgG5b95XNtwL3i6jMPubpxyq8PVxAen3dzT8r9vUhQ2PWU8SxeT6b",
    }),
  });

  const jwt = res.headers.get("set-cookie")?.match(/jwt=([^;]+)/)?.[1];

  expect(decodeJwt(jwt!).sub).toEqual(alice.id);

  expect((await res.json()).username).toEqual("alice");
});
