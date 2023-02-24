import { BACKEND_API_URL } from "@coral-xyz/common";

export const initPushNotificationHandlers = () => {
  self.addEventListener("push", function (event) {
    const data = event.data.json();

    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        requireInteraction: true,
        icon: data.image,
        image: data.image,
        tag: data.href,
      })
    );
  });

  self.addEventListener(
    "notificationclick",
    function (event) {
      const href = event.notification.tag;
      if (href) {
        clients.openWindow(href);
      }
      event.notification.close();
    },
    false
  );

  self.addEventListener("pushsubscriptionchange", function (event) {
    const SERVER_URL = `${BACKEND_API_URL}/notifications/register`;
    event.waitUntil(
      fetch(SERVER_URL, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subscription: event.newSubscription }),
      })
    );
  });
};
