import { Connection } from "@solana/web3.js";
import { useRecoilState } from "recoil";
import * as atoms from "../recoil/atoms";
import { BackgroundSolanaConnection } from "../background/solana-connection/client";

export function useSolanaConnection(): SolanaConnectionContext {
  const [connectionUrl, setConnectionUrl] = useRecoilState(atoms.connectionUrl);
  const connection = new BackgroundSolanaConnection(connectionUrl);
  return {
    connection,
    connectionUrl,
    setConnectionUrl,
  };
}

export type SolanaConnectionContext = {
  connection: Connection;
  connectionUrl: string;
  setConnectionUrl: (url: string) => void;
};
