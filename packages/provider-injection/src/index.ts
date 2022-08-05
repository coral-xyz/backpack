import { getLogger } from "@coral-xyz/common";
import { ProviderInjection } from "./provider";
import { ProviderXnftInjection } from "./provider-xnft";

const logger = getLogger("provider-injection");

// Entry.
function main() {
  logger.debug("starting injected script");
  initProvider();
  logger.debug("provider ready");
}

function initProvider() {
  window.backpack = new ProviderInjection();
  window.xnft = new ProviderXnftInjection();
}

main();
