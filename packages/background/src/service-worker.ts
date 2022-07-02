// This file is only used by the mobile app
import { logFromAnywhere } from "@coral-xyz/common";
import { start } from ".";

self.addEventListener("install", () => {
  start(true);
  self.skipWaiting();
});

self.addEventListener("activate", () => {
  self.clients.claim();
});

self.addEventListener("message", (event) => {
  logFromAnywhere("received event armani");
});
