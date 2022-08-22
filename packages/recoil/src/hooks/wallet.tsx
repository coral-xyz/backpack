import { useRecoilValue, useRecoilValueLoadable, Loadable } from "recoil";
import { Blockchain } from "@coral-xyz/common";
import { WalletPublicKeys } from "../types";
import * as atoms from "../atoms";

export function useActiveWalletLoadable(): Loadable<{
  publicKey: string;
  name: string;
}> {
  return useRecoilValueLoadable(atoms.activeWalletWithData)! as Loadable<any>;
}

export function useActiveWallet(): {
  publicKey: string;
  name: string;
  blockchain: Blockchain;
} {
  return useRecoilValue(atoms.activeWalletWithData)!;
}

export function useActiveWallets(): Array<{
  publicKey: string;
  name: string;
  blockchain: Blockchain;
}> {
  return useRecoilValue(atoms.activeWalletsWithData!);
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
  throw new Error("key not found");
}
