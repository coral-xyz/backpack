import { Chain } from "@coral-xyz/zeus";
import { HASURA_URL, JWT } from "./config";

const chain = Chain(HASURA_URL, {
  headers: {
    Authorization: `Bearer ${JWT}`,
  },
});

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
