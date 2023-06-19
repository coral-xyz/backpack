import type { Blockchain } from "@coral-xyz/common";
import { useRecoilValue } from "recoil";

import * as atoms from "../atoms";
import type { Wallet, WalletPublicKeys } from "../types";

export function useActiveEthereumWallet(): {
  publicKey: string;
  name: string;
} {
  return useRecoilValue(atoms.activeEthereumWallet)!;
}

export function useActiveSolanaWallet(): {
  publicKey: string;
  name: string;
} {
  return useRecoilValue(atoms.activeSolanaWallet)!;
}

export function useActiveWallet(): Wallet {
  return useRecoilValue(atoms.activeWallet);
}

export function useActiveWallets(): Array<{
  publicKey: string;
  name: string;
  blockchain: Blockchain;
}> {
  return useRecoilValue(atoms.activeWalletsWithData!);
}

export function useActivePublicKeys() {
  return useRecoilValue(atoms.activePublicKeys)!;
}

export function useWalletPublicKeys(): WalletPublicKeys {
  return useRecoilValue(atoms.walletPublicKeys);
}

export function useWalletName(address: string): string {
  const wallets = useWalletPublicKeys();
  for (const keyring of Object.values(wallets)) {
    for (const namedPublicKeys of Object.values(keyring)) {
      for (const namedPublicKey of namedPublicKeys) {
        if (namedPublicKey.publicKey === address) {
          return namedPublicKey.name;
        }
      }
    }
  }
  return "";
}

export function useWalletBlockchain(address: string): string {
  const wallets = useWalletPublicKeys();
  for (const [blockchain, keyring] of Object.entries(wallets)) {
    for (const namedPublicKeys of Object.values(keyring)) {
      for (const namedPublicKey of namedPublicKeys) {
        if (namedPublicKey.publicKey === address) {
          return blockchain;
        }
      }
    }
  }
  throw new Error("key not found");
}

export function useAllWalletsPerBlockchain(blockchain: Blockchain): Array<{
  name: string;
  type: string;
  publicKey: string;
  blockchain: Blockchain;
}> {
  return useRecoilValue(atoms.allWalletsPerBlockchain(blockchain));
}

export function useAllWallets(): Wallet[] {
  return useRecoilValue(atoms.allWallets);
}

export function useAllWalletsDisplayed(): Wallet[] {
  return useRecoilValue(atoms.allWalletsDisplayed);
}

export function useDehydratedWallets(): Array<{
  blockchain: Blockchain;
  publicKey: string;
}> {
  return useRecoilValue(atoms.dehydratedWallets);
}
