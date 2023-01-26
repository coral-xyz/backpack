import { BACKEND_API_URL } from "@coral-xyz/common";

export const initPushNotificationHandlers = () => {
  self.addEventListener("push", function (event) {
    const data = event.data.json();

    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        requireInteraction: true,
        image: data.image || "",
      })
    );
  });

  self.addEventListener(
    "notificationclick",
    function (event) {
      const data = event.data.json();
      if (data.href) {
        clients.openWindow(data.href);
      }
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
