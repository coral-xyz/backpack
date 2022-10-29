import { Chain } from "auth/src/zeus";

export const createSession = async (
  HASURA_URL,
  JWT,
  publicKey,
  clientSecret,
  blockchain
) => {
  const chain = Chain(HASURA_URL, {
    headers: {
      Authorization: `Bearer ${JWT}`,
    },
  });

  await chain("mutation")({
    insert_auth_stripe_onramp_one: [
      {
        object: {
          publicKey,
          clientSecret,
        },
      },
      {
        id: true,
      },
    ],
  });
};

export const updateSession = async (
  HASURA_URL,
  JWT,
  clientSecret,
  status,
  dump
) => {
  const chain = Chain(HASURA_URL, {
    headers: {
      Authorization: `Bearer ${JWT}`,
    },
  });

  await chain("mutation")({
    update_auth_stripe_onramp: [
      {
        _set: { client_secret: clientSecret, status, webhook_dump: dump },
        where: { client_secret: { _eq: clientSecret } },
      },
      {},
    ],
  });
};
