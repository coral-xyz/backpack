import {
  ProviderSolanaInjection,
  ProviderXnftInjection,
} from "@coral-xyz/provider-core";
import { getLogger } from "@coral-xyz/common";
import { register } from "@wallet-standard/wallets-backpack";

const logger = getLogger("provider-injection");

// Entry.
function main() {
  logger.debug("starting injected script");
  initProvider();
  logger.debug("provider ready");
}

function initProvider() {
  window.backpack = new ProviderSolanaInjection();
  window.xnft = new ProviderXnftInjection();

  register();
}

main();
