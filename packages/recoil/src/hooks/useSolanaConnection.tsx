import { useRecoilValue, useRecoilValueLoadable, Loadable } from "recoil";
import { Commitment, Connection } from "@solana/web3.js";
import { SolanaContext, BackgroundClient } from "@coral-xyz/common";
import * as atoms from "../atoms";
import { useSplTokenRegistry } from "./useSplTokenRegistry";
import { useActiveWallet } from "./useWallet";
import { useBackgroundClient } from "./useBackgroundClient";

export function useSolanaConnectionUrl(): string {
  return useRecoilValue(atoms.connectionUrl)!;
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
  const backgroundClient = useBackgroundClient();
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

export function useConnectionBackgroundClient(): BackgroundClient {
  return useRecoilValue(atoms.connectionBackgroundClient);
}

export type SolanaConnectionContext = {
  connection: Connection;
  connectionUrl: string;
  setConnectionUrl: (url: string) => void;
};
