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
import type {
  WalletProvider,
  BackpackProvider,
  WindowEthereum,
  Window,
} from "./types";

const logger = getLogger("provider-injection");

// Entry.
function main() {
  logger.debug("starting injected script");
  initProvider();
  logger.debug("provider ready");
}

function initProvider() {
  const solana = new ProviderSolanaInjection();

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

function initEthereum() {
  const ethereum = new ProviderEthereumInjection();

  // Setup the wallet router
  if (!window.walletRouter) {
    Object.defineProperty(window, "walletRouter", {
      value: {
        currentProvider: window.backpack,

        providers: [
          ...new Set([
            ...(window.ethereum
              ? // Coinbase wallet uses a providers array on window.ethereum, so
                // include those if already registered
                Array.isArray(window.ethereum.providers)
                ? [...window.ethereum.providers, window.ethereum]
                : // Else just window.ethereum if it is registered
                  [window.ethereum]
              : []),
            window.backpack,
          ]),
        ],

        setCurrentProvider(
          checkIdentity: (provider: WalletProvider) => boolean
        ) {
          if (!this.hasProvider(checkIdentity)) {
            throw new Error(
              "The given identity did not match to any of the recognized providers!"
            );
          }
          this.previousProvider = this.currentProvider;
          this.currentProvider = this.getProvider(checkIdentity);
        },

        addProvider(newProvider: WalletProvider) {
          if (!this.providers.includes(newProvider)) {
            this.providers.push(newProvider);
          }
          this.previousProvider = newProvider;
        },
      },
    });
  }

  let cachedWindowEthereumProxy: WindowEthereum;
  let cachedCurrentProvider: WalletProvider;

  Object.defineProperty(window, "ethereum", {
    get() {
      if (!window.walletRouter)
        throw new Error("Expected window.walletRouter to be set");

      // Provider cache exists
      if (
        cachedWindowEthereumProxy &&
        cachedCurrentProvider === window.walletRouter.currentProvider
      ) {
        return cachedWindowEthereumProxy;
      }

      cachedWindowEthereumProxy = new Proxy(
        window.walletRouter.currentProvider,
        {
          get(target, prop, receiver) {
            if (
              window.walletRouter &&
              !(prop in window.walletRouter.currentProvider) &&
              prop in window.walletRouter
            ) {
              return Reflect.get(target, prop, receiver);
            }
          },
        }
      );

      cachedCurrentProvider = window.walletRouter.currentProvider;

      return cachedWindowEthereumProxy;
    },

    set(newProvider) {
      window.walletRouter?.addProvider(newProvider);
    },
  });
}

main();
