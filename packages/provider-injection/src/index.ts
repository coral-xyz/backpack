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
import { register } from "@coral-xyz/wallet-standard";

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
      value: window.ethereum
        ? (() => {
            console.warn(
              "Backpack couldn't override window.ethereum, disable other Ethereum wallets to use Backpack"
            );
            return window.ethereum;
          })()
        : new ProviderEthereumInjection(),
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
        const xnft = new ProviderSolanaXnftInjection(requestManager, {
          ethereum: new ProviderEthereumXnftInjection(requestManager),
          solana: new ProviderSolanaXnftInjection(requestManager),
        });
        return xnft;
      })(),
    },
  });

  register();
}

main();
