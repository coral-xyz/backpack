self.addEventListener("push", function (event) {
  event.waitUntil(
    self.registration.showNotification("data.title", {
      body: "data.body",
    })
  );
});
