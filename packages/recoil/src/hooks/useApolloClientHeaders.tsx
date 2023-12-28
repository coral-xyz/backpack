import { useMemo } from "react";
import { Blockchain } from "@coral-xyz/common";
import { getBlockchainConfig } from "@coral-xyz/secure-clients";

import { useBlockchainConnectionUrlNullable } from "./useBlockchain";
import { useActiveWalletNullable } from "./wallet";

type ApolloCustomHeader = "x-blockchain-devnet" | "x-blockchain-rpc";
export type ApolloClientCustomHeaders = {
  [h in ApolloCustomHeader]?: string;
};

export function useApolloClientHeaders():
  | ApolloClientCustomHeaders
  | undefined {
  const wallet = useActiveWalletNullable();
  const config = getBlockchainConfig(wallet?.blockchain ?? Blockchain.SOLANA);
  const url = useBlockchainConnectionUrlNullable(
    wallet?.blockchain ?? Blockchain.SOLANA
  );

  const headers = useMemo<ApolloClientCustomHeaders | undefined>(() => {
    const isDefault =
      config.RpcConnectionUrls["MAINNET"]?.url === url ||
      config.RpcConnectionUrls["DEFAULT"]?.url === url;

    if (wallet === null || url === null || isDefault) {
      return undefined;
    }

    const isDevnet =
      url === "https://api.devnet.solana.com" ||
      Object.entries(config.RpcConnectionUrls).some(
        // NOTE: update list if other possible devnet key names exist
        ([key, val]) =>
          val.url === url && (key === "DEVNET" || key === "SEPOLIA")
      );

    if (isDevnet) {
      return { "x-blockchain-devnet": "true" };
    }
    return { "x-blockchain-rpc": url };
  }, [config.RpcConnectionUrls, url, wallet]);

  return headers;
}

export function useIsDevnet(): boolean {
  const headers = useApolloClientHeaders();
  return headers?.["x-blockchain-devnet"] === "true";
}
