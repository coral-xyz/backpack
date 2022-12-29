import { Chain } from "@coral-xyz/zeus";

import { HASURA_URL, JWT } from "../config";

const chain = Chain(HASURA_URL, {
  headers: {
    Authorization: `Bearer ${JWT}`,
  },
});

export const addNfts = ({
  nftId,
  collectionId,
}: {
  nftId: string;
  collectionId: string;
}) => {
  const response = await chain("mutation")({
    insert_auth_friendships_one: [
      {
        object: {
          user1,
          user2,
          are_friends: false,
        },
        on_conflict: {
          //@ts-ignore
          update_columns: ["are_friends"],
          //@ts-ignore
          constraint: "friendships_pkey",
        },
      },
      { id: true },
    ],
  });
};
