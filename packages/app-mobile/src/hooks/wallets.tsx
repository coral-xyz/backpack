import { useCallback } from "react";

import { UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE } from "@coral-xyz/common";
import {
  useActiveWallet,
  useAllWallets,
  useBackgroundClient,
  useDehydratedWallets,
} from "@coral-xyz/recoil";

import { Wallet } from "~types/types";

type ActiveWallet = Pick<Wallet, "blockchain" | "publicKey">;

export function useWallets(): {
  activeWallet: Wallet;
  allWallets: Wallet[];
  coldWallets: Wallet[];
  selectActiveWallet: (aw: ActiveWallet, cb?: () => void) => void;
} {
  const background = useBackgroundClient();
  const activeWallet = useActiveWallet();
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

  const selectActiveWallet = useCallback(
    async ({ publicKey, blockchain }: ActiveWallet, cb?: () => void) => {
      if (activeWallet.publicKey !== publicKey) {
        await background.request({
          method: UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE,
          params: [publicKey, blockchain],
        });
      }

      if (cb) {
        cb();
      }
    },
    [background, activeWallet.publicKey]
  );

  return {
    activeWallet,
    allWallets: [...activeWallets, ...dehydratedWallets],
    // @ts-expect-error
    coldWallets,
    selectActiveWallet,
  };
}
