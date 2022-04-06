import * as serverUi from "./handlers/server-ui";
import * as serverInjected from "./handlers/server-injected";
import * as wasmRuntime from "@200ms/wasm-runtime";
import { debug } from "../common";

//
// Entry.
//
function main() {
  debug("starting background script");
  serverInjected.start();
  serverUi.start();
  wasmRuntime.runtime();
}

main();
