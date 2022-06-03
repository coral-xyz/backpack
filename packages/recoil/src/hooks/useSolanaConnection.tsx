import {
  useRecoilState,
  useRecoilValue,
  useRecoilValueLoadable,
  Loadable,
} from "recoil";
import { Commitment, Connection } from "@solana/web3.js";
import { SolanaContext } from "@200ms/common";
import * as atoms from "../atoms";
import { useSplTokenRegistry } from "./useSplTokenRegistry";
import { getBackgroundClient } from "..";
import { useActiveWallet } from "./useWallet";

export function useSolanaConnectionUrl() {
  return useRecoilState(atoms.connectionUrl);
}

export function useAnchorContext() {
  return useRecoilValue(atoms.anchorContext);
}

export function useAnchorContextLoadable(): Loadable<any> {
  return useRecoilValueLoadable(atoms.anchorContext);
}

export function useSolanaCtx(): SolanaContext {
  const { publicKey: walletPublicKey } = useActiveWallet();
  const { tokenClient, provider } = useAnchorContext();
  const registry = useSplTokenRegistry();
  const commitment = useCommitment();
  const backgroundClient = getBackgroundClient();
  return {
    walletPublicKey,
    tokenClient,
    registry,
    commitment,
    backgroundClient,
    connection: provider.connection,
  };
}

export function useCommitment(): Commitment {
  return useRecoilValue(atoms.commitment);
}

export type SolanaConnectionContext = {
  connection: Connection;
  connectionUrl: string;
  setConnectionUrl: (url: string) => void;
};
