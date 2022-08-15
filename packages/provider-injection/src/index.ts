import { getLogger } from "@coral-xyz/common";
import { ProviderSolanaInjection } from "./provider-solana";
import { BackpackSolanaWallet } from "./provider-standard";
import { ProviderXnftInjection } from "./provider-xnft";

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

  window.navigator.wallets = window.navigator.wallets || [];
  window.navigator.wallets.push({
    method: "register",
    wallets: [new BackpackSolanaWallet()],
    callback() {},
  });
}

main();
