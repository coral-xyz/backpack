import { useRecoilValue, useRecoilValueLoadable, Loadable } from "recoil";
import { PublicKey } from "@solana/web3.js";
import * as atoms from "../atoms";

export function useActiveWalletLoadable(): Loadable<{
  publicKey: string;
  name: string;
}> {
  return useRecoilValueLoadable(atoms.activeWalletWithName)! as Loadable<any>;
}

export function useActiveWallet(): { publicKey: PublicKey; name: string } {
  const { publicKey, name } = useRecoilValue(atoms.activeWalletWithName)!;
  return {
    publicKey: new PublicKey(publicKey),
    name,
  };
}

export function useWalletPublicKeys(): {
  hdPublicKeys: Array<{
    publicKey: PublicKey;
    name: string;
  }>;
  importedPublicKeys: Array<{
    publicKey: PublicKey;
    name: string;
  }>;
  ledgerPublicKeys: Array<{
    publicKey: PublicKey;
    name: string;
  }>;
} {
  const keys = useRecoilValue(atoms.walletPublicKeys);
  return {
    hdPublicKeys: keys.hdPublicKeys.map((k: any) => {
      return {
        publicKey: new PublicKey(k.publicKey),
        name: k.name,
      };
    }),
    importedPublicKeys: keys.importedPublicKeys.map((k: any) => {
      return {
        publicKey: new PublicKey(k.publicKey),
        name: k.name,
      };
    }),
    ledgerPublicKeys: keys.ledgerPublicKeys.map((k: any) => {
      return {
        publicKey: new PublicKey(k.publicKey),
        name: k.name,
      };
    }),
  };
}
