import * as serverUi from "./handlers/server-ui";
import * as serverInjected from "./handlers/server-injected";

//
// Entry.
//
function main() {
  serverInjected.start();
  serverUi.start();
}

main();
