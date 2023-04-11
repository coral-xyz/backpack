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
  allWalletsDisplayed,
} from "@coral-xyz/recoil";
import { useRecoilValueLoadable } from "recoil";

const FAKE_DATA = [
  {
    publicKey: "0x57383A846Ffd2EB07822aD3D853be80495F7a986",
    name: "Wallet 1",
    isCold: false,
    blockchain: "ethereum",
    type: "derived",
  },
  {
    publicKey: "EcxjN4mea6Ah9WSqZhLtSJJCZcxY73Vaz6UVHFZZ5Ttz",
    name: "Wallet 1",
    isCold: false,
    blockchain: "solana",
    type: "derived",
  },
  {
    publicKey: "FwQyYwx8HyqkhaqUnrWfb5HgsHUCVsb7UHnWyXbhWYho",
    name: "Wallet 8",
    isCold: false,
    blockchain: "solana",
    type: "derived",
  },
  {
    blockchain: "ethereum",
    publicKey: "0x142a45983Be4c57d0EbE17976Cc13461Fd9fd15a",
    primary: false,
    name: "",
    type: "dehydrated",
  },
];

// consolidates a bunch of the shit we need from other places
// reader, move this to recoil
export function useWallets(): {
  activeWallet: Wallet;
  allWallets: Wallet[];
  onSelectWallet: (wallet: Wallet, cb: () => void) => void;
} {
  const wl = useRecoilValueLoadable(allWalletsDisplayed);
  const wallets = wl.state === "hasValue" ? wl.contents : [];

  // const activeWallet = useBlockchainActiveWallet(Blockchain.SOLANA);
  const background = useBackgroundClient();
  // const wallets = useAllWallets();
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
    activeWallet: { publicKey: "" },
    onSelectWallet,
    // allWallets: FAKE_DATA,
    allWallets: [...activeWallets, ...dehydratedWallets],
  };
}
