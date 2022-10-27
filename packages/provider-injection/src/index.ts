import {
  ProviderEthereumInjection,
  ProviderEthereumXnftInjection,
  ProviderRootXnftInjection,
  ProviderSolanaInjection,
  ProviderSolanaXnftInjection,
  ChainedRequestManager,
} from "@coral-xyz/provider-core";
import {
  getLogger,
  CHANNEL_PLUGIN_RPC_REQUEST,
  CHANNEL_PLUGIN_RPC_RESPONSE,
} from "@coral-xyz/common";
import { initialize } from "@coral-xyz/wallet-standard";

const logger = getLogger("provider-injection");

// Entry.
function main() {
  logger.debug("starting injected script");
  initProvider();
  logger.debug("provider ready");
}

function initProvider() {
  const solana = new ProviderSolanaInjection();
  const ethereum = new ProviderEthereumInjection();

  try {
    Object.defineProperty(window, "backpack", { value: solana });
  } catch (e) {
    console.warn(
      "Backpack couldn't override `window.backpack`. Disable other Solana wallets to use Backpack."
    );
  }

  try {
    Object.defineProperty(window, "ethereum", { value: ethereum });
  } catch (e) {
    console.warn(
      "Backpack couldn't override `window.ethereum`. Disable other Ethereum wallets to use Backpack."
    );
  }

  try {
    Object.defineProperty(window, "xnft", {
      value: (() => {
        //
        // XNFT Providers
        //
        const requestManager = new ChainedRequestManager(
          CHANNEL_PLUGIN_RPC_REQUEST,
          CHANNEL_PLUGIN_RPC_RESPONSE
        );
        const xnft = new ProviderRootXnftInjection(requestManager, {
          ethereum: new ProviderEthereumXnftInjection(requestManager),
          solana: new ProviderSolanaXnftInjection(requestManager),
        });
        return xnft;
      })(),
    });
  } catch (e) {
    console.warn(
      "Backpack couldn't override `window.xnft`. Disable other xNFT wallets to use Backpack."
    );
  }

  initialize(solana);
}

main();
