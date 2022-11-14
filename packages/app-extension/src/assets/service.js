self.addEventListener("activate", async () => {
  console.log("activated");
  self.addEventListener("push", function (event) {
    console.log("push");
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification("This is a notification", {
        body: "here is the body",
        requireInteraction: true,
      })
    );
  });

  self.addEventListener("pushsubscriptionchange", function (event) {
    console.log("pushsubscriptionchange");
    const SERVER_URL = "http://localhost:8787/notifications/register";
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
});
