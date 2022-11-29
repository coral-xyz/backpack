import { Chain } from "@coral-xyz/zeus";

export const createSession = async (
  HASURA_URL: string,
  JWT: string,
  publicKey: string,
  clientSecret: string
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
          public_key: publicKey,
          client_secret: clientSecret,
          status: "in_progress",
          webhook_dump: "",
        },
      },
      {
        id: true,
      },
    ],
  });
};

export const updateSession = async (
  HASURA_URL: string,
  JWT: string,
  clientSecret: string,
  status: string,
  dump: string
) => {
  const chain = Chain(HASURA_URL, {
    headers: {
      Authorization: `Bearer ${JWT}`,
    },
  });

  await chain("mutation")({
    update_auth_stripe_onramp: [
      {
        _set: { client_secret: clientSecret, status },
        where: { client_secret: { _eq: clientSecret } },
      },
      { affected_rows: true },
    ],
  });
};

export const getSession = async (
  HASURA_URL: string,
  JWT: string,
  clientSecret: string
) => {
  const chain = Chain(HASURA_URL, {
    headers: {
      Authorization: `Bearer ${JWT}`,
    },
  });

  return chain("query")({
    auth_stripe_onramp: [
      {
        where: { client_secret: { _eq: clientSecret } },
        limit: 1,
      },
      {
        status: true,
      },
    ],
  });
};
