import { Chain } from "@coral-xyz/zeus";
import { v4 as uuidv4 } from "uuid";

import { HASURA_URL, JWT } from "../config";

const chain = Chain(HASURA_URL, {
  headers: {
    Authorization: `Bearer ${JWT}`,
  },
});

export async function getOrcreateXnftSecret(xnftId: string) {
  const existingSecret = await fetchXnftSecret(xnftId);
  if (existingSecret) {
    return existingSecret;
  } else {
    const secret = uuidv4();
    await chain("mutation")({
      insert_auth_xnft_secrets_one: [
        {
          object: {
            xnft_id: xnftId,
            secret: secret,
          },
        },
        { id: true },
      ],
    });
    return secret;
  }
}

export async function fetchXnftSecret(xnftId: string) {
  const response = await chain("query")({
    auth_xnft_secrets: [
      {
        where: {
          xnft_id: { _eq: xnftId },
        },
      },
      {
        secret: true,
      },
    ],
  });
  return response.auth_xnft_secrets[0]?.secret;
}
