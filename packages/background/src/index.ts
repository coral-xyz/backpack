import * as serverUi from "./handlers/server-ui";
import * as serverInjected from "./handlers/server-injected";
import * as solanaConnection from "./handlers/solana-connection";

export * from "./keyring";
export * from "./popup";
export * from "./client";

// Starts the background service.
export function start() {
  serverInjected.start();
  serverUi.start();
  solanaConnection.start();
}
