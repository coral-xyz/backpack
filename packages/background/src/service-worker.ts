// This file is only used by the mobile app
import { BACKGROUND_SERVICE_WORKER_READY } from "@coral-xyz/common";

import { postMessageToIframe } from "./shared";
import { start } from ".";

self.addEventListener("install", async () => {
  await self.skipWaiting();
});

self.addEventListener("activate", async (event) => {
  await event.waitUntil(clients.claim());
  start({ isMobile: true });
  await postMessageToIframe({ type: BACKGROUND_SERVICE_WORKER_READY });
});
