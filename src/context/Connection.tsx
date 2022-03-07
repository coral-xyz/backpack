import { Connection } from "@solana/web3.js";
import { useRecoilState } from "recoil";
import { connectionUrlAtom } from "../recoil/atoms";

export function useConnection(): ConnectionContext {
  const [connectionUrl, setConnectionUrl] = useRecoilState(connectionUrlAtom);
  const connection = new Connection(connectionUrl);
  return {
    connection,
    connectionUrl,
    setConnectionUrl,
  };
}

export type ConnectionContext = {
  connection: Connection;
  connectionUrl: string;
  setConnectionUrl: (url: string) => void;
};
