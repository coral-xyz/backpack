import { useState, useEffect } from "react";
import ReactXnft, {
  LocalStorage,
  usePublicKey,
  useConnection,
} from "react-xnft";
import { PublicKey, Connection } from "@solana/web3.js";
import { Program } from "@project-serum/anchor";
import * as anchor from "@project-serum/anchor";
import { IDL, StableDiffusionMint } from "./idl-diffusion";

export function useDiffusionTokens() {
  const publicKey = usePublicKey();
  const connection = useConnection();

  const [tokenAccounts, setTokenAccounts] = useState<any | null>(null);
  useEffect(() => {
    (async () => {
      setTokenAccounts(null);
      const res = await fetchDiffusionTokens(publicKey, connection);
      setTokenAccounts(res[0]);
    })();
  }, [publicKey, connection]);
  if (tokenAccounts === null) {
    return null;
  }
  return {
    tokens: tokenAccounts,
  };
}

export async function fetchDiffusionTokens(
  wallet: PublicKey,
  connection: Connection
) {
  return await Promise.all([fetchTokenAccounts(wallet, connection)]);
}

async function fetchTokenAccounts(
  wallet: PublicKey,
  connection: Connection
): Promise<any> {
  const resp = await window.xnft.connection.customSplTokenAccounts(wallet);
  const tokens = resp.nftMetadata
    .map((m) => m[1])
    .filter((t) => t.tokenMetaUriData.name.startsWith("Double Diffusion #"));
  return tokens;
}


export function client(): Program<StableDiffusionMint> {
  return new Program<StableDiffusionMint>(IDL, MINT, window.xnft);
}

export const MINT = new PublicKey(
  "21XsV9Y1KjGnddGr1NZVGNqa2i4mRKL796jFiiuj65dw"
);


export const DIFFUSION = new PublicKey(
  "EmZmbNJCjLBFrEC9B8WqASaUfFhu38XU5dHXuzuReoru"
);