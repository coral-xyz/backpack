import { useAllWallets, useDehydratedWallets } from "@coral-xyz/recoil";

import { Wallet } from "~types/types";

export function useWallets(): {
  allWallets: Wallet[];
  coldWallets: Wallet[];
} {
  const wallets = useAllWallets();
  const activeWallets = wallets.filter((w) => !w.isCold);
  const coldWallets = wallets.filter((w) => w.isCold);

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
