import {
  CHANNEL_PLUGIN_RPC_REQUEST,
  CHANNEL_PLUGIN_RPC_RESPONSE,
  getLogger,
} from "@coral-xyz/common";
import {
  ChainedRequestManager,
  ProviderEthereumInjection,
  ProviderEthereumXnftInjection,
  ProviderRootXnftInjection,
  ProviderSolanaInjection,
} from "@coral-xyz/provider-core";
import { initialize } from "@coral-xyz/wallet-standard";

import type { WalletProvider, WindowEthereum } from "./types";

const logger = getLogger("provider-injection");

// Entry.
function main() {
  logger.debug("starting injected script");
  initSolana();
  initEthereum();
  logger.debug("provider ready");
}

function initSolana() {
  const solana = new ProviderSolanaInjection();

  try {
    Object.defineProperty(window, "backpack", { value: solana });
  } catch (e) {
    console.warn(
      "Backpack couldn't override `window.backpack`. Disable other Solana wallets to use Backpack."
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
          solana,
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

/**
 * Initialise window.ethereum with a proxy that can handle multiple wallets
 * colliding on `window.ethereum`.
 */
function initEthereum() {
  const backpackEthereum = new ProviderEthereumInjection();

  // Setup the wallet router
  if (!window.walletRouter) {
    Object.defineProperty(window, "walletRouter", {
      value: {
        currentProvider: window.ethereum ? window.ethereum : backpackEthereum,

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
            backpackEthereum,
          ]),
        ],

        setProvider(predicate: (provider: WalletProvider) => boolean) {
          const match = this.providers.find(predicate);
          if (!match) {
            throw new Error("No matching provider found");
          }
          this.previousProvider = this.currentProvider;
          this.currentProvider = match;
        },

        addProvider(newProvider: WalletProvider) {
          if (!this.providers.includes(newProvider)) {
            this.providers.push(newProvider);
          }
        },
      },
    });
  }

  // Preserve equality between component renders to avoid mistaken provider
  // detection changes
  let cachedWindowEthereumProxy: WindowEthereum;
  // If the cached provider changes, we want to change the cached proxy as well
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
            // Sites using web3-react force metamask usage by searching the
            // providers array, so remove it for specific sites
            // https://github.com/Uniswap/web3-react/blob/f5a54af645a4a2e125ee2f5ead6dd1ecd5d01dda/packages/metamask/src/index.ts#L56-L59
            if (
              window.walletRouter &&
              !(prop in window.walletRouter.currentProvider) &&
              prop in window.walletRouter
            ) {
              if (
                window.location.href.includes("app.uniswap.org") ||
                (window.location.href.includes("kwenta.io") &&
                  prop === "providers")
              ) {
                return null;
              }
              return window.walletRouter[prop];
            }
            return Reflect.get(target, prop, receiver);
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
