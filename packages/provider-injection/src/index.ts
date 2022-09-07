import {
  ProviderEthereumInjection,
  ProviderEthereumXnftInjection,
  ProviderSolanaInjection,
  ProviderSolanaXnftInjection,
  RequestManager,
} from "@coral-xyz/provider-core";
import {
  getLogger,
  CHANNEL_PLUGIN_RPC_REQUEST,
  CHANNEL_PLUGIN_RPC_RESPONSE,
} from "@coral-xyz/common";
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
  window.ethereum = new ProviderEthereumInjection();

  //
  // XNFT Providers
  //
  const requestManager = new RequestManager(
    CHANNEL_PLUGIN_RPC_REQUEST,
    CHANNEL_PLUGIN_RPC_RESPONSE,
    true
  );
  const solanaXnftInjection = new ProviderSolanaXnftInjection(requestManager);
  window.xnft = solanaXnftInjection;
  window.xnft.solana = solanaXnftInjection;
  window.xnft.ethereum = new ProviderEthereumXnftInjection(requestManager);

  try {
    register();
  } catch (e) {
    logger.error("standard wallet registration failed", e);
  }
}

main();
