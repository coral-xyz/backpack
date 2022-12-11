// This file is only used by the mobile app
import { BACKGROUND_SERVICE_WORKER_READY } from "@coral-xyz/common";

import { postMessageToIframe } from "./shared";
import { start } from ".";

self.addEventListener("install", () => {
  start({
    isMobile: true,
  });
  self.skipWaiting();
});

self.addEventListener("activate", () => {
  self.clients.claim();
  postMessageToIframe({ type: BACKGROUND_SERVICE_WORKER_READY });
});
