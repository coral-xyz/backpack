import type { SolanaSettings } from "@coral-xyz/blockchain-common";
import type { BackgroundClient, SolanaContext } from "@coral-xyz/common";
import { Blockchain } from "@coral-xyz/common";
import type { Connection } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import type { Loadable } from "recoil";
import { useRecoilValue, useRecoilValueLoadable } from "recoil";

import * as atoms from "../../atoms";
import { useBackgroundClient } from "../client";
import { useActiveSolanaWallet } from "../wallet";
import { useSplTokenRegistry } from "./useSplTokenRegistry";
import { useBlockchainSettings } from "../useBlockchain";

export function useAnchorContext(): any {
  return useRecoilValue(atoms.anchorContext);
}

export function useAnchorContextLoadable(): Loadable<any> {
  return useRecoilValueLoadable(atoms.anchorContext);
}

export function useSolanaCtx(): SolanaContext {
  const { publicKey } = useActiveSolanaWallet();
  const { tokenClient, provider } = useAnchorContext();
  const { commitment } = useBlockchainSettings(
    Blockchain.SOLANA
  ) as SolanaSettings;
  const registry = useSplTokenRegistry();
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
