import type { BackgroundClient } from "@coral-xyz/common";
import { Blockchain } from "@coral-xyz/common";
import type { SolanaContext } from "@coral-xyz/secure-clients/legacyCommon";
import type { Connection } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import type { Loadable } from "recoil";
import { useRecoilValue, useRecoilValueLoadable } from "recoil";

import * as atoms from "../../atoms";
import { useBackgroundClient } from "../client";
import { useActiveSolanaWallet } from "../wallet";

export function useSolanaConnectionUrl(): string {
  return useRecoilValue(atoms.blockchainConnectionUrl(Blockchain.SOLANA))!;
}

export function useAnchorContext(): any {
  return useRecoilValue(atoms.anchorContext);
}

export function useAnchorContextLoadable(): Loadable<any> {
  return useRecoilValueLoadable(atoms.anchorContext);
}

export function useSolanaCtx(_publicKeyOverride?: string): SolanaContext {
  const { publicKey } = useActiveSolanaWallet();
  const { tokenInterface, provider } = useAnchorContext();
  // const registry = useSplTokenRegistry();
  const commitment = useRecoilValue(
    atoms.blockchainCommitment(Blockchain.SOLANA)
  )!;
  const solanaClient = useRecoilValue(atoms.solanaClientAtom);
  const backgroundClient = useBackgroundClient();

  const walletPublicKey = new PublicKey(_publicKeyOverride ?? publicKey);

  return {
    walletPublicKey,
    tokenInterface,
    // registry,
    commitment,
    backgroundClient,
    connection: provider.connection,
    solanaClient,
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
