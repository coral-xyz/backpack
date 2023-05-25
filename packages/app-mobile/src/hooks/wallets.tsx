import { useCallback } from "react";

import { UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE } from "@coral-xyz/common";
import {
  useActiveWallet,
  useAllWallets,
  useBackgroundClient,
  useDehydratedWallets,
  usePrimaryWallets,
} from "@coral-xyz/recoil";

import { Wallet } from "~types/types";

export function useWallets(): {
  activeWallet: Wallet;
  allWallets: Wallet[];
  onSelectWallet: (wallet: Wallet, cb: () => void) => void;
} {
  const background = useBackgroundClient();
  const activeWallet = useActiveWallet();
  const wallets = useAllWallets();
  const activeWallets = wallets.filter((w) => !w.isCold);

  console.log("debug3:activeWallet", activeWallet);
  // cold wallets show up inverted color theme (white text on black)
  const coldWallets = wallets.filter((w) => w.isCold);
  const primaryWallets = usePrimaryWallets();

  // Dehydrated public keys are keys that exist on the server but cannot be
  // used on the client as we don't have signing data, e.g. mnemonic, private
  // key or ledger derivation path
  const dehydratedWallets = useDehydratedWallets().map((w: any) => ({
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
    activeWallet: {
      isCold: false,
      ...activeWallet,
    },
    onSelectWallet,
    allWallets: [...activeWallets, ...dehydratedWallets],
  };
}
