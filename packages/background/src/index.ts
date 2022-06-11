import { EventEmitter } from "eventemitter3";
import * as serverUi from "./frontend/server-ui";
import * as serverInjected from "./frontend/server-injected";
import * as solanaConnection from "./frontend/solana-connection";
import * as coreBackend from "./backend/core";
import * as solanaConnectionBackend from "./backend/solana-connection";
import { Background } from "./types";

export * from "./keyring";

//
// Entry: Starts the background service.
//
export function start(): Background {
  // Shared event message bus.
  const events = new EventEmitter();

  // Backend.
  const solanaB = solanaConnectionBackend.start(events);
  const coreB = coreBackend.start(events, solanaB);

  // Frontend.
  const _serverUi = serverInjected.start(events, coreB);
  const _serverInjected = serverUi.start(events, coreB);
  const _solanaConnection = solanaConnection.start(events, solanaB);

  return {
    _serverUi,
    _serverInjected,
    _solanaConnection,
  };
}
