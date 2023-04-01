// This file is only used by the mobile app
import { BACKGROUND_SERVICE_WORKER_READY } from "@coral-xyz/common";

import { postMessageToIframe } from "./shared";
import { start } from ".";

self.addEventListener("install", async () => {
  console.log("installing");
  start({
    isMobile: true,
  });

  console.log("is mobile true, installed");
  await self.skipWaiting();
});

self.addEventListener("activate", async () => {
  console.log("activating");
  await self.clients.claim();
  console.log("activating, claimed");
  postMessageToIframe({ type: BACKGROUND_SERVICE_WORKER_READY });
});
