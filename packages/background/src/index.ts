import { EventEmitter } from "eventemitter3";
import * as serverUi from "./frontend/server-ui";
import * as serverInjected from "./frontend/server-injected";
import * as solanaConnection from "./frontend/solana-connection";
import * as coreBackend from "./backend/core";
import * as solanaConnectionBackend from "./backend/solana-connection";
import type { Background, Config } from "./types";

export * from "./backend/keyring";

//
// Entry: Starts the background service.
//
export function start(cfg: Config): Background {
  // Shared event message bus.
  const events = new EventEmitter();

  // Backend.
  const solanaB = solanaConnectionBackend.start(events);
  const coreB = coreBackend.start(events, solanaB);

  // Frontend.
  const _serverUi = serverInjected.start(cfg, events, coreB);
  const _serverInjected = serverUi.start(cfg, events, coreB);
  const _solanaConnection = solanaConnection.start(cfg, events, solanaB);

  return {
    _serverUi,
    _serverInjected,
    _solanaConnection,
  };
}
