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
}): Promise<{ id: number; blockchain: "solana" | "ethereum" }> => {
  const publicKeyDetails = await chain("query")({
    auth_public_keys: [
      {
        where: { public_key: { _eq: publicKey } },
        limit: 1,
      },
      {
        id: true,
        blockchain: true,
      },
    ],
  });

  return {
    id: publicKeyDetails.auth_public_keys[0]?.id,
    blockchain: publicKeyDetails.auth_public_keys[0]?.blockchain,
  };
};

export const updatePublicKey = async ({
  userId,
  blockchain,
  publicKeyId,
  onlyInsert,
}: {
  userId: string;
  blockchain: "solana" | "ethereum";
  publicKeyId: number;
  onlyInsert?: boolean;
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
          update_columns: [onlyInsert ? "blockchain" : "public_key_id"],
          //@ts-ignore
          constraint: "user_active_publickey_mapping_pkey",
        },
      },
      { user_id: true },
    ],
  });
};
