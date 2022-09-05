import {
  RequestManager,
  ProviderEthereumInjection,
  ProviderEthereumXnftInjection,
  ProviderSolanaInjection,
  ProviderSolanaXnftInjection,
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

  window.xnft.signTransaction = (...args: any) => {
    console.warn(
      "this method is deprecated, use window.xnft.solana.signTransaction instead"
    );
    return solanaXnftInjection.signTransaction(...args);
  };

  window.xnft.send = (...args: any) => {
    console.warn(
      "this method is deprecated, use window.xnft.solana.send instead"
    );
    return solanaXnftInjection.send(...args);
  };

  window.xnft.sendAndConfirm = (...args: any) => {
    console.warn(
      "this method is deprecated, use window.xnft.solana.sendAndConfirm instead"
    );
    return solanaXnftInjection.sendAndConfirm(...args);
  };

  window.xnft.simulate = (...args: any) => {
    console.warn(
      "this method is deprecated, use window.xnft.solana.simulate instead"
    );
    return solanaXnftInjection.simulate(...args);
  };

  window.xnft.solana = solanaXnftInjection;
  window.xnft.ethereum = new ProviderEthereumXnftInjection(requestManager);

  try {
    register();
  } catch (e) {
    logger.error("standard wallet registration failed", e);
  }
}

main();
