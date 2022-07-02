// This file is only used by the mobile app
import { start } from ".";

self.addEventListener("install", () => {
  start({
    isMobile: true,
  });
  self.skipWaiting();
});

self.addEventListener("activate", () => {
  self.clients.claim();
});

self.addEventListener("message", (event) => {
  //  logFromAnywhere("received event armani");
});
