import { useState, useEffect } from "react";
import { Connection, PublicKey } from "@solana/web3.js";

export function usePublicKey(): PublicKey {
  console.log("using publicKey here", window.xnft.publicKey.toString());
  const [publicKey, setPublicKey] = useState(window.xnft.publicKey);
  useEffect(() => {
    window.xnft.on("publicKeyUpdate", () => {
      setPublicKey(window.xnft.publicKey);
    });
  }, [setPublicKey]);
  return publicKey;
}

export function useConnection(): Connection {
  const [connection, setConnection] = useState(window.xnft.connection);
  useEffect(() => {
    window.xnft.on("connectionUpdate", () => {
      setConnection(window.xnft.connection);
    });
  }, [setConnection]);
  return connection;
}
