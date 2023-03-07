import { Chain } from "@coral-xyz/zeus";

import { AUTH_HASURA_URL, AUTH_JWT } from "../config";

const chain = Chain(AUTH_HASURA_URL, {
  headers: {
    Authorization: `Bearer ${AUTH_JWT}`,
  },
});

export const insertNotification = (
  xnftId: string,
  uuid: string,
  { title, body }: { title: string; body: string }
) => {
  return chain("mutation")({
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
      },
    ],
  });
};
