import * as serverUi from "./handlers/server-ui";
import * as serverInjected from "./handlers/server-injected";
import * as solanaConnection from "./handlers/solana-connection";
import { Io } from "./io";

export * from "./keyring";
export * from "./client";

// Starts the background service.
export function start() {
  Io.start();
  serverInjected.start();
  serverUi.start();
  solanaConnection.start();
}
