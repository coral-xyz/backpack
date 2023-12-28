import {
  extensionDB,
  KeyringStore,
  secureStore,
} from "@coral-xyz/secure-background/legacyExport";
import { ToMobileAppTransportReceiver } from "@coral-xyz/secure-background/src/transports/ToMobileAppTransportReceiver";
import {
  combineTransportReceivers,
  FromContentScriptTransportReceiver,
  FromExtensionTransportReceiver,
  FromMobileAppTransportReceiver,
  LocalTransportReceiver,
  LocalTransportSender,
  NotificationBackgroundBroadcaster,
  ToMobileAppSecureUITransportSender,
  ToSecureUITransportSender,
} from "@coral-xyz/secure-clients";
import { startSecureService } from "@coral-xyz/secure-clients/service";
import type { SECURE_EVENTS } from "@coral-xyz/secure-clients/types";
import { EventEmitter } from "eventemitter3";

import * as coreBackend from "./backend/core";
import * as ethereumConnectionBackend from "./backend/ethereum-connection";
import * as solanaConnectionBackend from "./backend/solana-connection";
import * as ethereumConnection from "./frontend/ethereum-connection";
import * as serverInjected from "./frontend/server-injected";
import * as serverUi from "./frontend/server-ui";
import * as solanaConnection from "./frontend/solana-connection";
import type { Background, Config } from "./types";

//
// Entry: Starts the background service.
//
export function start(cfg: Config): Background {
  // Shared event message bus.
  const events = new EventEmitter();
  const notificationBroadcaster = new NotificationBackgroundBroadcaster(events);
  const backendEmitter = new EventEmitter();
  const legacyBackendReceiver = new LocalTransportReceiver(backendEmitter);
  const legacyBackendSender = new LocalTransportSender({
    origin: {
      name: "Backpack",
      address: "secure-background-service",
      context: "background",
    },
    forwardOrigin: true,
    emitter: backendEmitter,
  });
  const keyringStore = new KeyringStore(
    notificationBroadcaster,
    legacyBackendSender,
    secureStore
  );

  // Backends.
  const solanaB = solanaConnectionBackend.start(events);
  const ethereumB = ethereumConnectionBackend.start(events);
  const coreB = coreBackend.start(
    cfg,
    events,
    keyringStore,
    notificationBroadcaster,
    solanaB,
    ethereumB
  );

  // Frontend.
  const _serverInjected = serverInjected.start(cfg, events, coreB);
  const _serverUi = serverUi.start(cfg, events, coreB);
  const _solanaConnection = solanaConnection.start(cfg, events, solanaB);
  const _ethereumConnection = ethereumConnection.start(cfg, events, ethereumB);

  const [contentScriptReceiver, extensionReceiver, SecureUISender] =
    globalThis.chrome
      ? [
          new FromContentScriptTransportReceiver(),
          new FromExtensionTransportReceiver(),
          ToSecureUITransportSender,
        ]
      : [
          new ToMobileAppTransportReceiver(),
          new FromMobileAppTransportReceiver(),
          ToMobileAppSecureUITransportSender,
        ];

  const secureUISender = new SecureUISender<SECURE_EVENTS, "ui">({
    origin: {
      address: "secure-background",
      name: "Backpack",
      context: "background",
    },
    forwardOrigin: true,
  });

  // New secure service
  startSecureService(
    {
      notificationBroadcaster,
      secureUIClient: secureUISender,
      secureServer: combineTransportReceivers(
        contentScriptReceiver,
        extensionReceiver,
        legacyBackendReceiver
      ),
      secureDB: extensionDB,
    },
    keyringStore
  );

  if (globalThis.chrome) {
    if (globalThis.chrome.runtime.id) {
      // Keep alive for Manifest V3 service worker
      globalThis.chrome.runtime.onInstalled.addListener(() => {
        globalThis.chrome.alarms.get("keep-alive", (a) => {
          if (!a) {
            globalThis.chrome.alarms.create("keep-alive", {
              periodInMinutes: 0.1,
            });
          }
        });
      });
    }

    // Add a noop listener to the alarm. Without this, the service worker seems
    // to be deemed as idle by Chrome and will be killed after 30s.
    globalThis.chrome.alarms.onAlarm.addListener(() => {
      // Noop
      Function.prototype();
    });
  }

  return {
    _serverUi,
    _serverInjected,
    _solanaConnection,
    _ethereumConnection,
  };
}
