import { EventEmitter } from "eventemitter3";
import * as serverUi from "./frontend/server-ui";
import * as serverInjectedSolana from "./frontend/server-injected-solana";
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
  const _serverInjectedSolana = serverInjectedSolana.start(cfg, events, coreB);
  const _serverUi = serverUi.start(cfg, events, coreB);
  const _solanaConnection = solanaConnection.start(cfg, events, solanaB);

  return {
    _serverUi,
    _serverInjectedSolana,
    _solanaConnection,
  };
}
