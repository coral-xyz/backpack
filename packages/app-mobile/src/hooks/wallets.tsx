import { useCallback } from "react";

import { Wallet } from "@@types/types";
import {
  Blockchain,
  UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE,
} from "@coral-xyz/common";
import {
  useAllWallets,
  useBackgroundClient,
  useBlockchainActiveWallet,
  useDehydratedWallets,
} from "@coral-xyz/recoil";

// consolidates a bunch of the shit we need from other places
// reader, move this to recoil
export function useWallets(): {
  activeWallet: Wallet;
  allWallets: Wallet[];
  onSelectWallet: (wallet: Wallet, cb: () => void) => void;
} {
  const activeWallet = useBlockchainActiveWallet(Blockchain.SOLANA);
  const background = useBackgroundClient();
  const wallets = useAllWallets();
  const _dehydratedWallets = useDehydratedWallets();
  const activeWallets = wallets.filter((w) => !w.isCold);
  // const coldWallets = wallets.filter((w) => w.isCold);

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
      await background.request({
        method: UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE,
        params: [w.publicKey.toString(), w.blockchain],
      });

      cb();
    },
    [background]
  );

  return {
    activeWallet,
    onSelectWallet,
    allWallets: [...activeWallets, ...dehydratedWallets],
  };
}
