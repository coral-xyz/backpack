import {
  useRecoilValue,
  useRecoilValueLoadable,
  constSelector,
  Loadable,
} from "recoil";
import { PublicKey, Connection } from "@solana/web3.js";
import * as atoms from "@200ms/recoil";
import { KeyringStoreStateEnum } from "../keyring/store";
import { useNavigation, useNavigationRoot } from "../hooks/useNavigation";
import { useTab } from "../hooks/useTab";
import { useKeyringStoreState } from "../hooks/useKeyringStoreState";
import { useCommitment, useRecentBlockhash } from "./useRecentBlockhash";
import { useSplTokenRegistry } from "./useSplTokenRegistry";
import { SolanaContext } from "../common/solana";

// Bootstrap data for the initial load.
export function useBootstrap() {
  return useRecoilValue(atoms.bootstrap);
}

export function useBootstrapFast() {
  useRecoilValue(atoms.bootstrapFast);

  // Hack: load all the navigation atoms to prevent UI flickering.
  //       TODO: can batch these into a single request to the background script.
  const { tab } = useTab();
  useNavigationRoot(tab);
  useNavigation();
  useKeyringStoreState();
  useCommitment();
}

export function useActiveWalletLoadable(): Loadable<{
  publicKey: string;
  name: string;
}> {
  return useRecoilValueLoadable(atoms.activeWalletWithName)! as Loadable<any>;
}

export function useSolanaCtx(): SolanaContext {
  const { publicKey: walletPublicKey } = useActiveWallet();
  const recentBlockhash = useRecentBlockhash();
  const { tokenClient } = useAnchorContext();
  const registry = useSplTokenRegistry();
  const commitment = useCommitment();
  return {
    walletPublicKey,
    recentBlockhash,
    tokenClient,
    registry,
    commitment,
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
  const keyringStoreState = useKeyringStoreState();
  const isLocked = keyringStoreState === KeyringStoreStateEnum.Locked;
  // @ts-ignore
  const keys = useRecoilValue(
    isLocked
      ? constSelector({
          hdPublicKeys: [],
          importedPublicKeys: [],
          ledgerPublicKeys: [],
        })
      : atoms.walletPublicKeys
  );
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
