import { Chain } from "@coral-xyz/zeus";
import { AUTH_HASURA_URL, AUTH_JWT } from "../config";

const chain = Chain(AUTH_HASURA_URL, {
  headers: {
    Authorization: `Bearer ${AUTH_JWT}`,
  },
});

export const validateRoom = async (uuid: string, roomId: number) => {
  const response = await chain("query")({
    auth_friendships: [
      {
        where: {
          _or: [
            {
              id: { _eq: roomId },
              user1: { _eq: uuid },
            },
            {
              id: { _eq: roomId },
              user2: { _eq: uuid },
            },
          ],
        },
      },
      {
        id: true,
      },
    ],
  });

  if (response.auth_friendships) {
    return true;
  }

  return false;
};

export const updateLatestMessage = async (
  roomId: number,
  message: string,
  sender: string
) => {
  await chain("mutation")({
    update_auth_friendships: [
      {
        _set: {
          last_message_timestamp: new Date(),
          last_message: message,
          last_message_sender: sender,
        },
        where: { id: { _eq: roomId } },
      },
      { affected_rows: true },
    ],
  });
};
