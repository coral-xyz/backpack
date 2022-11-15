import { NOTIFICATION_SERVER_URL } from "@coral-xyz/common";

export const initPushNotificationHandlers = () => {
    self.addEventListener("push", function (event) {
        console.log("push");
        const data = event.data.json();
        console.log(data);
        event.waitUntil(
            self.registration.showNotification(data.title, {
                body: data.body,
                requireInteraction: true,
            })
        );
    });

    self.addEventListener("pushsubscriptionchange", function (event) {
        const SERVER_URL = `${NOTIFICATION_SERVER_URL}/notifications/register`;
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
}
