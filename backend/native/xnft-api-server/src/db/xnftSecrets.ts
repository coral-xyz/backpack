import { Chain } from "@coral-xyz/zeus";
import { HASURA_URL, JWT } from "../config";
import { v4 as uuidv4 } from "uuid";

const chain = Chain(HASURA_URL, {
  headers: {
    Authorization: `Bearer ${JWT}`,
  },
});

export async function fetchXnftSecret(xnftId: string) {
  const response = await chain("query")({
    auth_xnft_secrets: [
      {
        where: {
          xnft_id: { _eq: xnftId },
        },
      },
      {
        id: true,
        secret: true,
      },
    ],
  });
  return {
    secret: response.auth_xnft_secrets[0]?.secret || null,
    id: response.auth_xnft_secrets[0]?.id,
  };
}

export async function createXnftSecret(xnftId: string) {
  const secret = uuidv4();
  const existingSecretPkey = (await fetchXnftSecret(xnftId))?.id;
  if (existingSecretPkey) {
    await chain("mutation")({
      update_auth_xnft_secrets_by_pk: [
        {
          pk_columns: { id: existingSecretPkey },
          _set: { secret: secret },
        },
        { id: true },
      ],
    });
  } else {
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
  }

  return secret;
}

export async function fetchXnftFromSecret(secret: string) {
  const response = await chain("query")({
    auth_xnft_secrets: [
      {
        where: {
          secret: { _eq: secret },
        },
      },
      {
        xnft_id: true,
      },
    ],
  });
  return response.auth_xnft_secrets[0]?.xnft_id;
}
