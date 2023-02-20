import { Chain } from "@coral-xyz/zeus";

import { AUTH_HASURA_URL, AUTH_JWT } from "../config";

const chain = Chain(AUTH_HASURA_URL, {
  headers: {
    Authorization: `Bearer ${AUTH_JWT}`,
  },
});

export const getFriendship = async ({ room }: { room: number }) => {
  const response = await chain("query")({
    auth_friendships: [
      {
        where: {
          id: { _eq: room },
        },
      },
      {
        id: true,
        are_friends: true,
        user1: true,
        user2: true,
        last_message_sender: true,
        user1_last_read_message_id: true,
        user2_last_read_message_id: true,
      },
    ],
  });
  return response.auth_friendships[0] ?? null;
};
