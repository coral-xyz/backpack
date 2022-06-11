import { EventEmitter } from "eventemitter3";
import * as serverUi from "./frontend/server-ui";
import * as serverInjected from "./frontend/server-injected";
import * as solanaConnection from "./frontend/solana-connection";
import * as coreBackend from "./backend/core";
import * as solanaBackend from "./backend/solana-connection";
import { Background } from "./types";

export * from "./keyring";
export * from "./client";

// Starts the background service.
export function start(): Background {
  const events = new EventEmitter();

  const solanaB = solanaBackend.start(events);
  const coreB = coreBackend.start(events, solanaB);

  const _serverUi = serverInjected.start(coreB);
  const _serverInjected = serverUi.start(coreB);
  const _solanaConnection = solanaConnection.start(solanaB);

  return {
    _serverUi,
    _serverInjected,
    _solanaConnection,
  };
}
