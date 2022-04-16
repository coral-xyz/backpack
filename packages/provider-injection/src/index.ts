import { debug } from "@200ms/common";
import { ProviderInjection } from "./provider";
import { ProviderUiInjection } from "./provider-ui";

// Script entry.
function main() {
  debug("starting injected script");
  initProvider();
  debug("provider ready");
}

function initProvider() {
  // @ts-ignore
  window.anchor = new ProviderInjection();
  // @ts-ignore
  window.anchorUi = new ProviderUiInjection();
}

main();
