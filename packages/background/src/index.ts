import { CHANNEL_SECURE_BACKGROUND_NOTIFICATION } from "@coral-xyz/common";
import {
  KeyringStore,
  secureStore,
} from "@coral-xyz/secure-background/legacyExport";
import { ToMobileAppTransportReceiver } from "@coral-xyz/secure-background/src/transports/ToMobileAppTransportReceiver";
import {
  combineTransportReceivers,
  FromContentScriptTransportReceiver,
  FromExtensionTransportReceiver,
  FromMobileAppTransportReceiver,
  LocalBroadcastListener,
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
import * as serverInjected from "./frontend/server-injected";
import * as serverUi from "./frontend/server-ui";
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
  const localNotificationsListener = new LocalBroadcastListener(
    events,
    CHANNEL_SECURE_BACKGROUND_NOTIFICATION
  );
  const legacyBackendSender = new LocalTransportSender({
    origin: {
      name: "Backpack",
      address: "secure-background-service",
      context: "background",
    },
    forwardOrigin: true,
    emitter: backendEmitter,
  });
  const keyringStore = new KeyringStore(legacyBackendSender, secureStore);

  // Backends.
  const coreB = coreBackend.start(
    cfg,
    events,
    keyringStore,
    notificationBroadcaster
  );

  // Frontend.
  const _serverInjected = serverInjected.start(cfg, events, coreB);
  const _serverUi = serverUi.start(cfg, events, coreB);

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
      secureStore,
    },
    keyringStore
  );

  if (globalThis.chrome) {
    // Open the extension to the onboarding page immediately and automatically after installation
    globalThis.chrome.runtime.onInstalled.addListener((obj) => {
      if (obj.reason === globalThis.chrome.runtime.OnInstalledReason.INSTALL) {
        globalThis.chrome.tabs.create({
          url: globalThis.chrome.runtime.getURL(
            "/options.html?onboarding=true"
          ),
        });
      }
    });

    globalThis.chrome.runtime.onUpdateAvailable.addListener(() => {
      globalThis.chrome.runtime.reload();
    });

    localNotificationsListener.addListener((notification) => {
      if (notification.name === "NOTIFICATION_KEYRING_STORE_UNLOCKED") {
        globalThis.chrome.runtime.requestUpdateCheck((status) => {
          if (status === "update_available") {
            globalThis.chrome.runtime.reload();
          }
          if (status === "throttled") {
            console.warn("chrome.runtime.requestUpdateCheck", status);
          }
        });
      }
    });
  }

  return {
    _serverUi,
    _serverInjected,
  };
}
