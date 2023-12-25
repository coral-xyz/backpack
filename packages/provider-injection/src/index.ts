import {
  MOBILE_APP_TRANSPORT_SENDER_EVENTS,
  FromContentScriptTransportSender,
  ToMobileAppTransportSender,
} from "@coral-xyz/secure-clients";

// This is a bit of a hack, it's speicifically at the top of this file
// to ensure it's loaded before other code
if (globalThis.ReactNativeWebView && !globalThis.isHiddenWebView) {
  Object.defineProperty(window, "___fromApp", {
    value: (ev) => {
      MOBILE_APP_TRANSPORT_SENDER_EVENTS.emit("message", {
        // hardcoded because importing the constant would import common before this code
        channel: "channel-secure-ui-background-response",
        data: ev,
      });
    },
  });
  Object.defineProperty(window, "___toApp", {
    value: (data) => {
      globalThis.ReactNativeWebView.postMessage(JSON.stringify(data));
    },
  });
}

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
import { v4 as uuidV4 } from "uuid";

import type {
  EIP1193Provider,
  EIP6963RequestProviderEvent,
  WindowEthereum,
} from "./types";
import { TransportSender } from "@coral-xyz/secure-clients/types";
import { UserClient } from "@coral-xyz/secure-clients";

const logger = getLogger("provider-injection");

// Entry.
function main() {
  logger.debug("starting injected script");

  const Sender = globalThis.chrome
    ? FromContentScriptTransportSender
    : ToMobileAppTransportSender;
  const secureClientSender = new Sender({
    origin: {
      context: "browser",
      name: document.title,
      address: window.location.origin,
    },
  });
  initPing(secureClientSender);
  initSolana(secureClientSender);
  initEthereum(secureClientSender);
  logger.debug("provider ready");
}

function initPing(secureClientSender) {
  const userClient = new UserClient(secureClientSender);
  const ping = async () => {
    await userClient.ping();
    setTimeout(() => {
      requestAnimationFrame(ping);
    }, 5000);
  };
  ping();
}

function initSolana(secureClientSender: TransportSender) {
  const solana = new ProviderSolanaInjection(secureClientSender);

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
function initEthereum(secureClientSender: TransportSender) {
  const backpackEthereum = new ProviderEthereumInjection(secureClientSender);

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

        setProvider(predicate: (provider: EIP1193Provider) => boolean) {
          const match = this.providers.find(predicate);
          if (!match) {
            throw new Error("No matching provider found");
          }
          this.previousProvider = this.currentProvider;
          this.currentProvider = match;
        },

        addProvider(newProvider: EIP1193Provider) {
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
  let cachedCurrentProvider: EIP1193Provider;

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

  // EIP-6963: https://eips.ethereum.org/EIPS/eip-6963
  const info = {
    uuid: uuidV4(),
    name: "Backpack",
    icon: "data:image/svg+xml, %3Csvg xmlns='http://www.w3.org/2000/svg' width='55' height='80' viewBox='0 0 55 80' fill='none' %3E%3Cpath fillRule='evenodd' clipRule='evenodd' d='M32.71 6.29026C35.6178 6.29026 38.3452 6.68005 40.8705 7.40296C38.3982 1.64085 33.2649 0 27.5519 0C21.8277 0 16.6855 1.64729 14.2188 7.43692C16.7255 6.68856 19.4412 6.29026 22.339 6.29026H32.71ZM21.6739 12.0752C7.86677 12.0752 0 22.9371 0 36.336V50.1C0 51.4399 1.11929 52.5 2.5 52.5H52.5C53.8807 52.5 55 51.4399 55 50.1V36.336C55 22.9371 45.8521 12.0752 32.0449 12.0752H21.6739ZM27.4805 36.4551C32.313 36.4551 36.2305 32.5376 36.2305 27.7051C36.2305 22.8726 32.313 18.9551 27.4805 18.9551C22.648 18.9551 18.7305 22.8726 18.7305 27.7051C18.7305 32.5376 22.648 36.4551 27.4805 36.4551ZM0 60.5901C0 59.2503 1.11929 58.1641 2.5 58.1641H52.5C53.8807 58.1641 55 59.2503 55 60.5901V75.1466C55 77.8264 52.7614 79.9988 50 79.9988H5C2.23857 79.9988 0 77.8264 0 75.1466V60.5901Z' fill='%23E33E3F' /%3E%3C/svg%3E",
    rdns: "app.backpack",
  };

  function announceProvider() {
    window.dispatchEvent(
      new CustomEvent("eip6963:announceProvider", {
        detail: Object.freeze({ info, provider: backpackEthereum }),
      })
    );
  }
  window.addEventListener("eip6963:requestProvider", announceProvider);
  announceProvider();
}

main();
