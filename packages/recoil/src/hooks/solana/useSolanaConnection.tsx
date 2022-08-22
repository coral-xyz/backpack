import { useRecoilValue, useRecoilValueLoadable, Loadable } from "recoil";
import { PublicKey, Connection } from "@solana/web3.js";
import { SolanaContext, BackgroundClient } from "@coral-xyz/common";
import * as atoms from "../../atoms";
import { useSplTokenRegistry } from "./useSplTokenRegistry";
import { useActiveWallet } from "../wallet";
import { useSolanaCommitment } from "../preferences";
import { useBackgroundClient } from "../client";

export function useSolanaConnectionUrl(): string {
  return useRecoilValue(atoms.solanaConnectionUrl)!;
}

export function useAnchorContext() {
  return useRecoilValue(atoms.anchorContext);
}

export function useAnchorContextLoadable(): Loadable<any> {
  return useRecoilValueLoadable(atoms.anchorContext);
}

export function useSolanaCtx(): SolanaContext {
  const { publicKey } = useActiveWallet();
  const { tokenClient, provider } = useAnchorContext();
  const registry = useSplTokenRegistry();
  const commitment = useSolanaCommitment();
  const backgroundClient = useBackgroundClient();
  return {
    walletPublicKey: new PublicKey(publicKey),
    tokenClient,
    registry,
    commitment,
    backgroundClient,
    connection: provider.connection,
  };
}

export function useConnectionBackgroundClient(): BackgroundClient {
  return useRecoilValue(atoms.connectionBackgroundClient);
}

export type SolanaConnectionContext = {
  connection: Connection;
  connectionUrl: string;
  setConnectionUrl: (url: string) => void;
};
