import { HASURA_URL, JWT } from "../config";

import { Chain } from "@coral-xyz/zeus";

const chain = Chain(HASURA_URL, {
  headers: {
    Authorization: `Bearer ${JWT}`,
  },
});

export const getSubscriptions = async (username: string) => {
  return chain("query")({
    auth_notification_subscriptions: [
      {
        where: { username: { _eq: (username as string) || "" } },
        limit: 5,
      },
      {
        username: true,
        endpoint: true,
        expirationTime: true,
        p256dh: true,
        auth: true,
        id: true,
      },
    ],
  });
};

export const deleteSubscription = (id: number) => {
  return chain("mutation")({
    delete_auth_notification_subscriptions_by_pk: [
      {
        id,
      },
      {
        id: true,
      },
    ],
  });
};
