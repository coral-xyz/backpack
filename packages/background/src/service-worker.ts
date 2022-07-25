// This file is only used by the mobile app
import { start } from ".";
import { postMessageToIframe } from "./shared";
import { BACKGROUND_SERVICE_WORKER_READY } from "@coral-xyz/common";

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
