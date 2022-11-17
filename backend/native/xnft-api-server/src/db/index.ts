import { HASURA_URL, JWT } from "../config";

import { Chain } from "@coral-xyz/zeus";
import { NotificationProps } from "../controllers/notifications";

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

export const hasNotificationAccess = async (
  xnftId: string,
  username: string
): Promise<boolean> => {
  const response = await chain("query")({
    auth_xnft_preferences: [
      {
        where: { xnft_id: { _eq: xnftId }, username: { _eq: username } },
        limit: 1,
      },
      {
        notifications: true,
      },
    ],
  });
  if (response.auth_xnft_preferences?.[0]?.notifications) {
    return true;
  }
  return false;
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

export const insertNotification = (
  xnftId: string,
  username: string,
  { title, body }: NotificationProps
) => {
  return chain("mutation")({
    insert_auth_notifications_one: [
      {
        object: {
          title,
          body,
          username,
          xnft_id: xnftId,
          timestamp: new Date(),
          uuid: "",
          image: "",
        },
      },
      {
        id: true,
      },
    ],
  });
};
