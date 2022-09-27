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
  Object.defineProperties(window, {
    backpack: {
      value: new ProviderSolanaInjection(),
    },
    ethereum: {
      value: new ProviderEthereumInjection(),
    },
    xnft: {
      value: (() => {
        //
        // XNFT Providers
        //
        const requestManager = new RequestManager(
          CHANNEL_PLUGIN_RPC_REQUEST,
          CHANNEL_PLUGIN_RPC_RESPONSE,
          true
        );
        const xnft = new ProviderSolanaXnftInjection(requestManager);
        Object.defineProperties(xnft, {
          solana: {
            value: new ProviderSolanaXnftInjection(requestManager),
          },
          ethereum: {
            value: new ProviderEthereumXnftInjection(requestManager),
          },
        });
        return xnft;
      })(),
    },
  });
  try {
    register();
  } catch (e) {
    logger.error("standard wallet registration failed", e);
  }
}

main();
