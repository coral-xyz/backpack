import { Chain } from "@coral-xyz/zeus";

import { HASURA_URL, JWT } from "../config";
import type { NotificationProps } from "../controllers/notifications";

const chain = Chain(HASURA_URL, {
  headers: {
    Authorization: `Bearer ${JWT}`,
  },
});

export const getSubscriptions = async (uuid: string) => {
  return chain("query")({
    auth_notification_subscriptions: [
      {
        where: { uuid: { _eq: (uuid as string) || "" } },
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
  uuid: string
): Promise<boolean> => {
  const response = await chain("query")({
    auth_xnft_preferences: [
      {
        where: { xnft_id: { _eq: xnftId }, uuid: { _eq: uuid } },
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

  // if no preferences found.
  if (!response.auth_xnft_preferences?.[0]) {
    // allow notifications by default for ONE and Dropzone xNFTs
    if (
      [
        "4ekUZj2TKNoyCwnRDstvViCZYkhnhNoWNQpa5bBLwhq4",
        "CVkbt7dscJdjAJFF2uKrtin6ve9M8DA4gsUccAjePUHH",
      ].includes(xnftId)
    ) {
      return true;
    }
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
  uuid: string,
  { title, body }: NotificationProps
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
