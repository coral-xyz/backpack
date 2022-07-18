import { useConnection, usePublicKey } from "react-xnft";
import { fetchTokens } from "@coral-xyz/common";
import { AnchorProvider, Spl } from "@project-serum/anchor";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Vault } from "./types";
import { fetchAllVaults } from "./utils";

export const TokenContext = createContext<Record<string, unknown>>({});

export const useTokenMap = () => useContext(TokenContext);

export const TokenContextProvider: React.FC = ({ children }) => {
  const connection = useConnection();
  const publicKey = usePublicKey();
  const [tokenMap, setTokenMap] = useState({});

  useEffect(() => {
    (async () => {
      // @ts-ignore
      const provider = new AnchorProvider(connection);
      const tokenClient = Spl.token(provider);
      const _tokenMap = await fetchTokens(publicKey, tokenClient as any);
      setTokenMap(_tokenMap);
    })();
  }, [connection, publicKey]);

  return (
    <TokenContext.Provider value={tokenMap}>{children}</TokenContext.Provider>
  );
};

const VaultMetadataContext = createContext<Record<string, Vault>>({});

export const useVaultMetadata = () => useContext(VaultMetadataContext);

export const VaultMetadataProvider: React.FC = ({ children }) => {
  const [vaults, setVaults] = useState<Record<string, Vault>>({});

  useEffect(() => {
    (async () => {
      const resp = await fetchAllVaults();
      if (resp) {
        setVaults(resp.vaults);
      }
    })();
  }, []);

  return (
    <VaultMetadataContext.Provider value={vaults}>
      {children}
    </VaultMetadataContext.Provider>
  );
};
