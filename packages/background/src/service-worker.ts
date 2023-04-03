// This file is only used by the mobile app
import { BACKGROUND_SERVICE_WORKER_READY } from "@coral-xyz/common";

import { postMessageToIframe } from "./shared";
import { start } from ".";

let isStarted = false;
console.log("window:isStarted", isStarted);

self.addEventListener("install", async () => {
  console.log("install:isStarted", isStarted);

  start({ isMobile: true });

  // actives the current service worker immediately
  console.log("install:skipWaiting...");
  await self.skipWaiting();
  console.log("install:skipped...");
});

self.addEventListener("activate", async (event) => {
  console.log("activate:isStarted", isStarted);

  // Override default behavior of service worker and claim the page without having to reload the page
  console.log("activate:waitUntil...");
  await event.waitUntil(clients.claim());
  console.log("activate:claimed");

  console.log("activate:postMessageToIframe...");
  // This is most important line on mobile
  await postMessageToIframe({ type: BACKGROUND_SERVICE_WORKER_READY });
  console.log("activate:posted");
  isStarted = true;
});

self.addEventListener("fetch", async () => {
  console.log("fetch:isStarted", isStarted);
  await self.clients.claim();

  // Start the service worker if it hasn't been started yet
  if (!isStarted) {
    await postMessageToIframe({ type: BACKGROUND_SERVICE_WORKER_READY });
    isStarted = true;
  }
});
