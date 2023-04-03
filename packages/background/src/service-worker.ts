// This file is only used by the mobile app
import { BACKGROUND_SERVICE_WORKER_READY } from "@coral-xyz/common";

import { postMessageToIframe } from "./shared";
import { start } from ".";

let isStarted = false;
console.log("window:isStarted", isStarted);

self.addEventListener("install", async () => {
  console.log("install:isStarted", isStarted);

  if (!isStarted) {
    start({ isMobile: true });
  }

  // actives the current service worker immediately
  console.log("install:skipWaiting...");
  await self.skipWaiting();
  console.log("install:skipped...");
  isStarted = true; // called after skipWaiting to ensure its only called once
});

self.addEventListener("activate", async (event) => {
  console.log("activate:isStarted", isStarted);

  // Override default behavior of service worker and claim the page without having to reload the page
  console.log("activate:waitUntil...");
  await event.waitUntil(clients.claim());
  console.log("activate:claimed");

  if (!isStarted) {
    start({ isMobile: true });
    isStarted = true;
  }

  console.log("activate:postMessageToIframe...");
  await postMessageToIframe({ type: BACKGROUND_SERVICE_WORKER_READY });
  console.log("activate:posted");
});

self.addEventListener("fetch", () => {
  console.log("fetch:isStarted", isStarted);
  // Start the service worker if it hasn't been started yet
  if (!isStarted) {
    start({ isMobile: true });
    isStarted = true;
  }
});
