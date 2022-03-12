import React, { useContext, useMemo } from "react";
import { Program, Provider, Spl, SplToken } from "@project-serum/anchor";
import { useSolanaConnection } from "../context/Connection";
import { useSolanaWallet } from "../context/Wallet";

type AnchorContext = {
  provider: Provider;
  tokenClient: Program<SplToken>;
};
const _AnchorContext = React.createContext<AnchorContext | null>(null);

// TODO: can we remove this?
export function AnchorProvider(props: any) {
  const { connection } = useSolanaConnection();
  const wallet = useSolanaWallet();
  const provider = useMemo(() => {
    const opts = {
      skipPreflight: false,
      commitment: "recent",
      preflightCommitment: "recent",
    };

    // @ts-ignore
    return new Provider(connection, wallet, opts);
  }, [connection]);
  const tokenClient = useMemo(() => {
    return Spl.token(provider);
  }, [provider]);

  return (
    <_AnchorContext.Provider
      value={{
        provider,
        tokenClient,
      }}
    >
      {props.children}
    </_AnchorContext.Provider>
  );
}

export function useAnchorContext(): AnchorContext {
  const ctx = useContext(_AnchorContext);
  if (ctx === null) {
    throw new Error("Context not available");
  }
  return ctx;
}
