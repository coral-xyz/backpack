import { useCallback } from "react";

import { UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE } from "@coral-xyz/common";
import { useBackgroundClient, useDehydratedWallets } from "@coral-xyz/recoil";

import { useActiveWallet, useAllWallets } from "./recoil";

import { Wallet } from "~types/types";

// TODO something about useAllWallets breaks when its inside react-navigation
// This issue only takes place on the first screen of a navigator
// This issue does NOT take place when used outside of react-navigation
// The current fix is to wrap the hooks in useRecoilValueLoadable and process without Suspense
export function useWallets(): {
  activeWallet: Wallet;
  allWallets: Wallet[];
  onSelectWallet: (wallet: Wallet, cb: () => void) => void;
} {
  const background = useBackgroundClient();
  const activeWallet = useActiveWallet();
  const { data: wallets } = useAllWallets();
  const _dehydratedWallets = useDehydratedWallets();
  const activeWallets = wallets.filter((w) => !w.isCold);
  // const coldWallets = wallets.filter((w) => w.isCold); // TODO cold wallets?

  // Dehydrated public keys are keys that exist on the server but cannot be
  // used on the client as we don't have signing data, e.g. mnemonic, private
  // key or ledger derivation path
  const dehydratedWallets = _dehydratedWallets.map((w: any) => ({
    ...w,
    name: "", // TODO server side does not sync wallet names
    type: "dehydrated",
  }));

  const onSelectWallet = useCallback(
    async (w: Wallet, cb: any) => {
      if (activeWallet.publicKey !== w.publicKey) {
        await background.request({
          method: UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE,
          params: [w.publicKey.toString(), w.blockchain],
        });
      }

      cb();
    },
    [background, activeWallet.publicKey]
  );

  return {
    activeWallet,
    onSelectWallet,
    allWallets: [...activeWallets, ...dehydratedWallets],
  };
}
