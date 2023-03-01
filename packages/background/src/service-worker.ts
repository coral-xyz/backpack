// This file is only used by the mobile app
import { BACKGROUND_SERVICE_WORKER_READY } from "@coral-xyz/common";

import { postMessageToIframe } from "./shared";
import { start } from "./";

self.addEventListener("install", async () => {
  start({ isMobile: true });
  await self.skipWaiting();
});

self.addEventListener("activate", async () => {
  await self.clients.claim();
  postMessageToIframe({ type: BACKGROUND_SERVICE_WORKER_READY });
});
