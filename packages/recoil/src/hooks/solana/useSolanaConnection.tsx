import type { BackgroundClient } from "@coral-xyz/common";
import { Blockchain } from "@coral-xyz/common";
import type { SolanaContext } from "@coral-xyz/secure-clients/legacyCommon";
import type { Cluster, Connection } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import type { Loadable } from "recoil";
import {
  atom,
  useRecoilState,
  useRecoilValue,
  useRecoilValueLoadable,
} from "recoil";
import useAsyncEffect from "use-async-effect";

import * as atoms from "../../atoms";
import { useBackgroundClient } from "../client";
import { useActiveSolanaWallet } from "../wallet";

export function useSolanaConnectionUrl(): string {
  return useRecoilValue(atoms.blockchainConnectionUrl(Blockchain.SOLANA))!;
}

export function useAnchorContext() {
  return useRecoilValue(atoms.anchorContext);
}

export function useAnchorContextLoadable(): Loadable<any> {
  return useRecoilValueLoadable(atoms.anchorContext);
}

const clusterCacheAtom = atom<null | { rpc: string; cluster: Cluster | null }>({
  key: "clusterCache",
  default: null,
});

export function useSolanaCtx(_publicKeyOverride?: string): SolanaContext {
  const { publicKey } = useActiveSolanaWallet();
  const { tokenInterface, provider, connectionUrl } = useAnchorContext();
  const commitment = useRecoilValue(
    atoms.blockchainCommitment(Blockchain.SOLANA)
  )!;
  const solanaClient = useRecoilValue(atoms.solanaClientAtom);
  const backgroundClient = useBackgroundClient();

  const walletPublicKey = new PublicKey(_publicKeyOverride ?? publicKey);

  const [clusterCache, setClusterCache] = useRecoilState(clusterCacheAtom);
  useAsyncEffect(
    // eslint-disable-next-line react-hooks/exhaustive-deps
    async (isMounted) => {
      if (clusterCache?.rpc === connectionUrl || !provider?.connection) {
        return;
      }
      const genesisHash = await provider.connection.getGenesisHash();
      if (!isMounted()) {
        return;
      }
      try {
        switch (genesisHash) {
          case "EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG":
            return setClusterCache({ rpc: connectionUrl, cluster: "devnet" });
          case "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d":
            return setClusterCache({
              rpc: connectionUrl,
              cluster: "mainnet-beta",
            });
          default:
            throw new Error(
              `Solana RPC Cluster (${genesisHash}) not known or supported`
            );
        }
      } catch (err) {
        console.error(err);
        setClusterCache(null);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [connectionUrl]
  );

  return {
    walletPublicKey,
    tokenInterface,
    // registry,
    commitment,
    backgroundClient,
    connection: provider.connection,
    connectionCluster: clusterCache?.cluster,
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
