import { Connection } from "@solana/web3.js";
import { useRecoilState } from "recoil";
import * as atoms from "../recoil/atoms";

export function useSolanaConnection(): SolanaConnectionContext {
  const [connectionUrl, setConnectionUrl] = useRecoilState(atoms.connectionUrl);
  const connection = new Connection(connectionUrl);
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
