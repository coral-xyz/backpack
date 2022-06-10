import { Io } from "./io";
import * as serverUi from "./handlers/server-ui";
import * as serverInjected from "./handlers/server-injected";
import * as solanaConnection from "./handlers/solana-connection";
import * as backend from "./backend";

export * from "./keyring";
export * from "./client";

// Starts the background service.
export function start() {
  backend.start();
  Io.start();
  serverInjected.start();
  serverUi.start();
  solanaConnection.start();
}
