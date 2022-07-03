// This file is only used by the mobile app
import { start } from ".";
import { logFromAnywhere } from "@coral-xyz/common";

self.addEventListener("install", () => {
  logFromAnywhere("install here armani");
  start({
    isMobile: true,
  });
  self.skipWaiting();
});

self.addEventListener("activate", () => {
  logFromAnywhere("activate here armani");
  self.clients.claim();
});

self.addEventListener("message", (event) => {
  logFromAnywhere("message here armani");
});
