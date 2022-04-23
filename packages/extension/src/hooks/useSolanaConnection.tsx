import { useRecoilState } from "recoil";
import { Connection } from "@solana/web3.js";
import { BackgroundSolanaConnection } from "@200ms/recoil";
import * as atoms from "@200ms/recoil";

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
