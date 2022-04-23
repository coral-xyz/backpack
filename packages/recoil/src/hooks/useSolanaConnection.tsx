import { useRecoilState } from "recoil";
import { Connection } from "@solana/web3.js";
import { BackgroundSolanaConnection } from "../background";
import * as atoms from "../atoms";

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
