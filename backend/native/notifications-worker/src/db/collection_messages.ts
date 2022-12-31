import { Chain } from "@coral-xyz/zeus";

import { AUTH_HASURA_URL, AUTH_JWT } from "../config";

const chain = Chain(AUTH_HASURA_URL, {
  headers: {
    Authorization: `Bearer ${AUTH_JWT}`,
  },
});

export const getLatestReadMessage = async (uuid: string, room: string) => {
  const response = await chain("query")({
    auth_collection_messages_by_pk: [
      {
        collection_id: room,
        uuid: uuid,
      },
      {
        last_read_message_id: true,
      },
    ],
  });
  return response.auth_collection_messages_by_pk.last_read_message_id;
};
