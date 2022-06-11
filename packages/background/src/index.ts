import { Io } from "./io";
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
  Io.start();

  const solanaB = solanaBackend.start();
  const coreB = coreBackend.start(solanaB);

  const _serverUi = serverInjected.start(coreB);
  const _serverInjected = serverUi.start(coreB);
  const _solanaConnection = solanaConnection.start(solanaB);

  return {
    _serverUi,
    _serverInjected,
    _solanaConnection,
  };
}
