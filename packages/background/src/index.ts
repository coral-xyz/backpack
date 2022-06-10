import { Io } from "./io";
import * as serverUi from "./handlers/server-ui";
import * as serverInjected from "./handlers/server-injected";
import * as solanaConnection from "./handlers/solana-connection";
import * as backend from "./backend";
import * as solanaBackend from "./solana-connection/backend";

export * from "./keyring";
export * from "./client";

// Starts the background service.
export function start() {
  const solanaB = solanaBackend.start();
  const b = backend.start(solanaB);

  Io.start();
  serverInjected.start(b);
  serverUi.start(b);
  solanaConnection.start(solanaB);
}
