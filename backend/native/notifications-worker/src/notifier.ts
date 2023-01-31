import webpush from "web-push";

import { deleteSubscription, getSubscriptions } from "./db/notifications";
import { VAPID_PRIVATE_KEY, VAPID_PUBLIC_KEY } from "./config";

const vapidKeys = {
  publicKey: VAPID_PUBLIC_KEY,
  privateKey: VAPID_PRIVATE_KEY,
};

webpush.setVapidDetails(
  "mailto:admin@200ms.io",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

export const notify = async (
  to: string,
  title: string,
  body: string,
  href?: string,
  image?: string
) => {
  const responses = await getSubscriptions(to);

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
            href,
            image,
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
