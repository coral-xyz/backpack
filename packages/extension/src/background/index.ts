import * as serverUi from "./handlers/server-ui";
import * as serverInjected from "./handlers/server-injected";
import * as wasmRuntime from "@200ms/wasm-runtime";

//
// Entry.
//
function main() {
  serverInjected.start();
  serverUi.start();
  wasmRuntime.runtime();
}

main();
