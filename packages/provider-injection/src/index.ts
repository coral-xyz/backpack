import { getLogger } from "@coral-xyz/common";
import { ProviderInjection } from "./provider";
import { ProviderUiInjection } from "./provider-ui";

const logger = getLogger("provider-injection");

// Entry.
function main() {
  logger.debug("starting injected script");
  initProvider();
  logger.debug("provider ready");
}

function initProvider() {
  window.backpack = new ProviderInjection();
  window.anchorUi = new ProviderUiInjection();
}

main();
