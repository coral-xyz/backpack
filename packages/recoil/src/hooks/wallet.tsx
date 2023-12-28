import type { Blockchain } from "@coral-xyz/common";
import { useRecoilValue } from "recoil";

import * as atoms from "../atoms";
import type { Wallet } from "../types";

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
export function useActiveWalletNullable(): Wallet | null {
  return useRecoilValue(atoms.activeWalletNullable);
}

export function useActiveWallets(): Array<Wallet> {
  return useRecoilValue(atoms.activeWallets);
}

export function useActivePublicKeys() {
  return useRecoilValue(atoms.activePublicKeys)!;
}

export function useWallet(blockchain: Blockchain, publicKey: string): Wallet {
  return useRecoilValue(atoms.blockchainWallet({ blockchain, publicKey }));
}

export function useAllWalletsPerBlockchain(
  blockchain: Blockchain
): Array<Wallet> {
  return useRecoilValue(atoms.allWalletsPerBlockchain(blockchain));
}

export function useAllWallets(): Wallet[] {
  return useRecoilValue(atoms.allWallets);
}
export function useAllWalletsNullable(): Wallet[] | null {
  return useRecoilValue(atoms.allWalletsNullable);
}

export function useAllWalletsDisplayed(): Wallet[] {
  return useRecoilValue(atoms.allWalletsDisplayed);
}
