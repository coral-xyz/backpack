import { Chain } from "@coral-xyz/zeus";

import { HASURA_URL, JWT } from "../config";

const chain = Chain(HASURA_URL, {
  headers: {
    Authorization: `Bearer ${JWT}`,
  },
});

export const getPublicKeyDetails = async ({
  publicKey,
}: {
  publicKey: string;
}): Promise<{ id: number }> => {
  const publicKeyDetails = await chain("query")({
    auth_public_keys: [
      {
        where: { public_key: { _eq: publicKey } },
      },
      {
        id: true,
        limit: 1,
      },
    ],
  });

  return {
    id: publicKeyDetails.auth_public_keys[0]?.id,
  };
};

export const updatePublicKey = async ({
  userId,
  blockchain,
  publicKeyId,
}: {
  userId: string;
  blockchain: "solana" | "ethereum";
  publicKeyId: number;
}) => {
  await chain("mutation")({
    insert_auth_user_active_publickey_mapping_one: [
      {
        object: {
          blockchain,
          user_id: userId,
          public_key_id: publicKeyId,
        },
        on_conflict: {
          //@ts-ignore
          update_columns: ["public_key_id"],
          //@ts-ignore
          constraint: "user_active_publickey_mapping_pkey",
        },
      },
      { user_id: true },
    ],
  });
};
