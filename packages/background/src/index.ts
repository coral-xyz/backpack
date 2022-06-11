import { Io } from "./io";
import * as serverUi from "./frontend/server-ui";
import * as serverInjected from "./frontend/server-injected";
import * as solanaConnection from "./frontend/solana-connection";
import * as coreBackend from "./backend/core";
import * as solanaBackend from "./backend/solana-connection";

export * from "./keyring";
export * from "./client";

// Starts the background service.
export function start() {
  Io.start();

  const solanaB = solanaBackend.start();
  const coreB = coreBackend.start(solanaB);

  serverInjected.start(coreB);
  serverUi.start(coreB);
  solanaConnection.start(solanaB);
}
