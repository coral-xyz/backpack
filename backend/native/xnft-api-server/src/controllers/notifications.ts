import { insertNotification } from "@coral-xyz/backend-common";
import webpush from "web-push";

import { VAPID_PRIVATE_KEY, VAPID_PUBLIC_KEY } from "../config";
import {
  deleteSubscription,
  getSubscriptions,
  hasNotificationAccess,
} from "../db";

export interface NotificationProps {
  title: string;
  body: string;
}

const vapidKeys = {
  publicKey: VAPID_PUBLIC_KEY,
  privateKey: VAPID_PRIVATE_KEY,
};

webpush.setVapidDetails(
  "mailto:admin@200ms.io",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

export const sendNotifications = async (
  xnftAddress: string,
  userIds: string[],
  { title, body }: NotificationProps
) => {
  const promises = userIds.map(async (uuid) => {
    await insertNotification(xnftAddress, uuid, { title, body });
    await sendPushNotification(xnftAddress, uuid, { title, body });
  });
  await Promise.all(promises);
};

export const sendPushNotification = async (
  xnftAddress: string,
  uuid: string,
  { title, body }: NotificationProps
) => {
  const hasAccess = await hasNotificationAccess(xnftAddress, uuid);
  if (!hasAccess) {
    return;
  }
  const responses = await getSubscriptions(uuid);
  await Promise.all(
    responses.auth_notification_subscriptions.map(async (response) => {
      const subscription = {
        endpoint: response.endpoint,
        expirationTime: response.expirationTime || null,
        keys: {
          p256dh: response.p256dh,
          auth: response.auth,
        },
      };
      try {
        // @ts-ignore
        await webpush.sendNotification(
          subscription,
          JSON.stringify({
            title,
            body,
            href: `/popup.html#/notifications?title="Notifications"&props=%7B%7D&nav=tab`,
          })
        );
      } catch (e) {
        // @ts-ignore
        if (e?.statusCode === 410 && e.body?.includes("unsubscribed")) {
          await deleteSubscription(response.id);
        }
        // @ts-ignore
        if (e?.statusCode === 403) {
          await deleteSubscription(response.id);
        }
      }
    })
  );
};
