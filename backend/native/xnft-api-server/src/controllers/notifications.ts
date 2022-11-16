import webpush from "web-push";
import { deleteSubscription, getSubscriptions } from "../db";
import { VAPID_PRIVATE_KEY, VAPID_PUBLIC_KEY } from "../config";

interface NotificationProps {
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
  usernames: string[],
  { title, body }: NotificationProps
) => {
  const promises = usernames.map((username) =>
    sendNotification(xnftAddress, username, { title, body })
  );
  await Promise.all(promises);
};

export const sendNotification = async (
  xnftAddress: string,
  username: string,
  { title, body }: NotificationProps
) => {
  // TODO: check if this xnft address has access to send push notifications to this user.
  const responses = await getSubscriptions(username);
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
            title: "title1",
            body: "description1 " + Math.random(),
          })
        );
      } catch (e) {
        // @ts-ignore
        if (e?.statusCode === 410 && e.body?.includes("unsubscribed")) {
          await deleteSubscription(response.id);
        }
      }
    })
  );
};
