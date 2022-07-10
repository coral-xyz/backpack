import { useState, useEffect } from "react";
import { Connection, PublicKey } from "@solana/web3.js";

export function usePublicKey(): PublicKey {
  const [publicKey, setPublicKey] = useState(window.anchorUi.publicKey);
  useEffect(() => {
    window.anchorUi.on("publicKeyUpdate", () => {
      setPublicKey(window.anchorUi.publicKey);
    });
  }, [setPublicKey]);
  return publicKey;
}

export function useConnection(): Connection {
  const [connection, setConnection] = useState(window.anchorUi.connection);
  useEffect(() => {
    window.anchorUi.on("connectionUpdate", () => {
      setConnection(window.anchorUi.connection);
    });
  }, [setConnection]);
  return connection;
}

export function useLocalStorage(): Store {
  return {
    //    get: (key) => window.anchorUi.getStorage(key),
    //    set: (key, val) => window.anchorUi.setStorage(key, val),
    // @ts-ignore
    get: (key) =>
      new Promise((resolve) => resolve(window.localStorage.getItem(key))),
    // @ts-ignore
    set: (key, val) =>
      new Promise((resolve) => resolve(window.localStorage.setItem(key, val))),
  };
}

export interface Store {
  get<T>(key: string): Promise<T>;
  set<T>(key: string, val: T): Promise<void>;
}
