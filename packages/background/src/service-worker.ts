// This file is only used by the mobile app
import { start } from ".";

self.addEventListener("install", (event) => {
  event.waitUntil(async () => {
    start();
  });
});
