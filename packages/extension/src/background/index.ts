import * as serverUi from "./handlers/server-ui";
import * as serverInjected from "./handlers/server-injected";
import * as solanaConnection from "./handlers/solana-connection";

//
// Entry.
//
function main() {
  serverInjected.start();
  serverUi.start();
  solanaConnection.start();
}

main();
