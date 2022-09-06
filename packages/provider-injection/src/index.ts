import {
  ProviderEthereumInjection,
  ProviderEthereumXnftInjection,
  ProviderSolanaInjection,
  ProviderSolanaXnftInjection,
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

  //
  // XNFT Providers
  //
  const solanaXnftInjection = new ProviderSolanaXnftInjection();
  window.xnft = solanaXnftInjection;
  window.xnft.solana = solanaXnftInjection;
  window.xnft.ethereum = new ProviderEthereumXnftInjection();

  try {
    register();
  } catch (e) {
    logger.error("standard wallet registration failed", e);
  }
}

main();
