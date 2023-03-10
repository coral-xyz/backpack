import { Chain } from "@coral-xyz/zeus";

import { AUTH_HASURA_URL, AUTH_JWT } from "../config";

const chain = Chain(AUTH_HASURA_URL, {
  headers: {
    Authorization: `Bearer ${AUTH_JWT}`,
  },
});

export const insertNotification = async (
  xnftId: string,
  uuid: string,
  { title, body }: { title: string; body: string }
) => {
  const response = await chain("mutation")({
    insert_auth_notifications_one: [
      {
        object: {
          title,
          body,
          uuid,
          xnft_id: xnftId,
          timestamp: new Date(),
          username: "",
          image: "",
        },
      },
      {
        id: true,
        title: true,
        body: true,
        xnft_id: true,
        timestamp: true,
        uuid: true,
      },
    ],
  });
  return response.insert_auth_notifications_one;
};
