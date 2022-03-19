import { PublicKey, Transaction } from "@solana/web3.js";
import { Connection } from "@solana/web3.js";
import {
  useRecoilValue,
  useRecoilValueLoadable,
  constSelector,
  Loadable,
} from "recoil";
import * as atoms from "../recoil/atoms";
import { KeyringStoreStateEnum } from "../keyring/store";
import { useLoadSplTokens } from "../hooks/useLoadSplTokens";
import { useNavigation, useNavigationRoot } from "../hooks/useNavigation";
import { useTab } from "../hooks/useTab";
import { useKeyringStoreState } from "../hooks/useKeyringStoreState";

// Bootstrap data for the initial load.
export function useBootstrap() {
  return useRecoilValue(atoms.bootstrap);
}

export function useBootstrapFast() {
  useRecoilValue(atoms.bootstrapFast);

  // Hack: load all the navigation atoms to prevent UI flickering.
  const { tab } = useTab();
  useNavigationRoot(tab);
  useNavigation();
  useKeyringStoreState();
}

export function useBackgroundPoll() {
  useLoadSplTokens();
}

export function useSolanaWallet(): SolanaWallet {
  return useRecoilValue(atoms.solanaWallet)!;
}

export function useSolanaWalletLoadable(): Loadable<SolanaWallet> {
  return useRecoilValueLoadable(atoms.solanaWallet)!;
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
} {
  const keyringStoreState = useKeyringStoreState();
  const isLocked = keyringStoreState === KeyringStoreStateEnum.Locked;
  // @ts-ignore
  const keys = useRecoilValue(
    isLocked
      ? constSelector({ hdPublicKeys: [], importedPublicKeys: [] })
      : atoms.walletPublicKeys
  );
  return {
    hdPublicKeys: keys.hdPublicKeys.map((k) => {
      return {
        publicKey: new PublicKey(k.publicKey),
        name: k.name,
      };
    }),
    importedPublicKeys: keys.importedPublicKeys.map((k) => {
      return {
        publicKey: new PublicKey(k.publicKey),
        name: k.name,
      };
    }),
  };
}

export function useActiveWallet(): { publicKey: PublicKey; name: string } {
  const { publicKey, name } = useRecoilValue(atoms.activeWalletWithName)!;
  return {
    publicKey: new PublicKey(publicKey),
    name,
  };
}

export function useAnchorContext() {
  return useRecoilValue(atoms.anchorContext);
}

export function useAnchorContextLoadable(): Loadable<any> {
  return useRecoilValueLoadable(atoms.anchorContext);
}

export type ConnectionContext = {
  connection: Connection;
  connectionUrl: string;
  setConnectionUrl: (url: string) => void;
};

interface Wallet {
  publicKey: string;
  signTransaction(tx: any): any;
}

export class SolanaWallet {
  constructor(readonly publicKey: PublicKey) {}

  signTransaction(tx: Transaction): Transaction {
    // todo
    return tx;
  }
}
