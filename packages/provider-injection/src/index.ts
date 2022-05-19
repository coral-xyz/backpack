import { getLogger } from "@200ms/common";
import { ProviderInjection } from "./provider";
import { ProviderUiInjection } from "./provider-ui";

const logger = getLogger("provider-injection");

// Script entry.
function main() {
  logger.debug("starting injected script");
  initProvider();
  logger.debug("provider ready");
}

function initProvider() {
  window.anchor = new ProviderInjection();
  window.anchorUi = new ProviderUiInjection();
}

main();
