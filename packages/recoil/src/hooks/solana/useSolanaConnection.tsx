import type { BackgroundClient, SolanaContext } from "@coral-xyz/common";
import type { Connection } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import type { Loadable } from "recoil";
import { useRecoilValue, useRecoilValueLoadable } from "recoil";

import * as atoms from "../../atoms";
import { useBackgroundClient } from "../client";
import { useActiveSolanaWallet } from "../wallet";

import { useSplTokenRegistry } from "./useSplTokenRegistry";
import { useSolanaCommitment } from "./";

export function useSolanaConnectionUrl(): string {
  return useRecoilValue(atoms.solanaConnectionUrl)!;
}

export function useAnchorContext(): any {
  return useRecoilValue(atoms.anchorContext);
}

export function useAnchorContextLoadable(): Loadable<any> {
  return useRecoilValueLoadable(atoms.anchorContext);
}

export function useSolanaCtx(): SolanaContext {
  const { publicKey } = useActiveSolanaWallet();
  const { tokenInterface, provider } = useAnchorContext();
  const registry = useSplTokenRegistry();
  const commitment = useSolanaCommitment();
  const backgroundClient = useBackgroundClient();
  return {
    walletPublicKey: new PublicKey(publicKey),
    tokenInterface,
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
