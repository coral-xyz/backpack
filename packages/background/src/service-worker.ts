// This file is only used by the mobile app
import { BACKGROUND_SERVICE_WORKER_READY } from "@coral-xyz/common";

import { postMessageToIframe } from "./shared";
import { start } from ".";

let isStarted = false;

self.addEventListener("install", async () => {
  console.log("installing");

  if (!isStarted) {
    start({ isMobile: true });
    isStarted = true;
  }

  console.log("is mobile true, installed");

  // actives the current service worker immediately
  await self.skipWaiting();
});

self.addEventListener("activate", async (event) => {
  console.log("activated");

  // Override default behavior of service worker and claim the page without having to reload the page
  await event.waitUntil(clients.claim());

  console.log("activating, claimed");
  await postMessageToIframe({ type: BACKGROUND_SERVICE_WORKER_READY });
});

self.addEventListener("fetch", () => {
  // Start the service worker if it hasn't been started yet
  if (!isStarted) {
    start({ isMobile: true });
    isStarted = true;
  }
});
