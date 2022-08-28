import { useState, useEffect } from "react";
import { Connection, PublicKey } from "@solana/web3.js";

export function usePublicKey(): PublicKey {
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

// Returns true if the `window.xnft` object is ready to be used.
export function useDidLaunch() {
  const [didConnect, setDidConnect] = useState(false);
  useEffect(() => {
    window.addEventListener("load", () => {
      window.xnft.on("connect", () => {
        setDidConnect(true);
      });
      window.xnft.on("disconnect", () => {
        setDidConnect(false);
      });
    });
  }, []);
  return didConnect;
}
