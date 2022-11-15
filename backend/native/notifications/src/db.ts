import { Chain } from "@coral-xyz/zeus";
import { HASURA_URL, JWT } from "./config";

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

export const insertSubscription = (
  publicKey: string,
  username: string,
  subscription: any
) => {
  return chain("mutation")({
    insert_auth_notification_subscriptions_one: [
      {
        object: {
          public_key: publicKey,
          username,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          expirationTime: subscription.expirationTime || "",
        },
      },
      {
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
