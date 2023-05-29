import { IS_MOBILE } from "@coral-xyz/common";
import { EventEmitter } from "eventemitter3";

import * as coreBackend from "./backend/core";
import * as ethereumConnectionBackend from "./backend/ethereum-connection";
import { KeyringStore } from "./backend/keyring";
import { initPushNotificationHandlers } from "./backend/push-notifications";
import * as solanaConnectionBackend from "./backend/solana-connection";
import * as ethereumConnection from "./frontend/ethereum-connection";
import * as serverInjected from "./frontend/server-injected";
import * as serverUi from "./frontend/server-ui";
import * as solanaConnection from "./frontend/solana-connection";
import type { Background, Config } from "./types";

export * from "./backend/keyring";

//
// Entry: Starts the background service.
//
export function start(cfg: Config): Background {
  // Shared event message bus.
  const events = new EventEmitter();

  // Backends.
  const solanaB = solanaConnectionBackend.start(events);
  const ethereumB = ethereumConnectionBackend.start(events);
  const keyringStore = new KeyringStore(events);
  const coreB = coreBackend.start(events, keyringStore, solanaB, ethereumB);

  // Frontend.
  const _serverInjected = serverInjected.start(cfg, events, coreB);
  const _serverUi = serverUi.start(cfg, events, coreB);
  const _solanaConnection = solanaConnection.start(cfg, events, solanaB);
  const _ethereumConnection = ethereumConnection.start(cfg, events, ethereumB);

  initPushNotificationHandlers();

  if (!IS_MOBILE) {
    if (chrome && chrome?.runtime?.id) {
      // Keep alive for Manifest V3 service worker
      chrome.runtime.onInstalled.addListener(() => {
        chrome.alarms.get("keep-alive", (a) => {
          if (!a) {
            chrome.alarms.create("keep-alive", { periodInMinutes: 0.1 });
          }
        });
      });
    }

    // Add a noop listener to the alarm. Without this, the service worker seems
    // to be deemed as idle by Chrome and will be killed after 30s.
    chrome.alarms.onAlarm.addListener(() => {
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
