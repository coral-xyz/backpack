import { useAllWallets, useDehydratedWallets } from "@coral-xyz/recoil";

import { Wallet } from "~types/types";

type Result = {
  coldWallets: Wallet[];
  activeWallets: Wallet[];
};

function groupByColdWallet(wallets: Wallet[]): Result {
  return wallets.reduce(
    (result: Result, wallet) => {
      if (wallet.isCold) {
        result.coldWallets.push(wallet);
      } else {
        result.activeWallets.push(wallet);
      }
      return result;
    },
    { coldWallets: [], activeWallets: [] }
  );
}

export function useWallets(): {
  allWallets: Wallet[];
  coldWallets: Wallet[];
} {
  const wallets = useAllWallets();
  const { activeWallets, coldWallets } = groupByColdWallet(wallets);

  // Dehydrated public keys are keys that exist on the server but cannot be
  // used on the client as we don't have signing data, e.g. mnemonic, private
  // key or ledger derivation path
  const dehydratedWallets = useDehydratedWallets().map((w: any) => ({
    ...w,
    name: "", // TODO server side does not sync wallet names
    type: "dehydrated",
  }));

  return {
    allWallets: [...activeWallets, ...dehydratedWallets],
    coldWallets,
  };
}
