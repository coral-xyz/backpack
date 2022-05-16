import {
  useRecoilState,
  useRecoilValue,
  useRecoilValueLoadable,
  Loadable,
} from "recoil";
import { Connection } from "@solana/web3.js";
import { SolanaContext } from "@200ms/common";
import { useCommitment, useRecentBlockhash } from "./useRecentBlockhash";
import * as atoms from "../atoms";
import { useSplTokenRegistry } from "./useSplTokenRegistry";
import { getBackgroundClient } from "..";
import { useActiveWallet } from "./useWallet";

export function useSolanaConnectionUrl() {
  return useRecoilState(atoms.connectionUrl);
}

export function useAnchorContext(): any {
  return useRecoilValue(atoms.anchorContext);
}

export function useAnchorContextLoadable(): Loadable<any> {
  return useRecoilValueLoadable(atoms.anchorContext);
}

export function useSolanaCtx(): SolanaContext {
  const { publicKey: walletPublicKey } = useActiveWallet();
  const recentBlockhash = useRecentBlockhash();
  const { tokenClient } = useAnchorContext();
  const registry = useSplTokenRegistry();
  const commitment = useCommitment();
  const backgroundClient = getBackgroundClient();
  return {
    walletPublicKey,
    recentBlockhash,
    tokenClient,
    registry,
    commitment,
    backgroundClient,
  };
}

export type SolanaConnectionContext = {
  connection: Connection;
  connectionUrl: string;
  setConnectionUrl: (url: string) => void;
};
