import { Chain } from "auth/src/zeus";

export const createSession = async (
  HASURA_URL,
  JWT,
  publicKey,
  clientSecret
) => {
  const chain = Chain(HASURA_URL, {
    headers: {
      Authorization: `Bearer ${JWT}`,
    },
  });

  await chain("mutation")({
    insert_onramp_stripe_onramp_sessions_one: [
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
    insert_onramp_stripe_onramp_sessions_one: [
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
