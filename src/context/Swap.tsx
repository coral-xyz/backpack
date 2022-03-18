import React, { useContext, useState } from "react";
import * as anchor from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { useSolanaWallet } from "./Wallet";

type SwapContext = {
  fromAmount: number;
  setFromAmount: any;

  toAmount: number;
  setToAmount: any;

  fromMint: string;
  toMint: string;

  setToMint: (mint: string) => void;
  setFromMint: (mint: string) => void;
  swapToFromMints: any;

  fromToken: string;
  toToken: string;
};
const _SwapContext = React.createContext<SwapContext | null>(null);

const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
);
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const WSOL_MINT = "So11111111111111111111111111111111111111112";

export function SwapProvider(props: any) {
  const [[fromMint, toMint], setFromMintToMint] = useState([
    WSOL_MINT,
    USDC_MINT,
  ]);
  const [fromAmount, setFromAmount] = useState(0); // todo
  const [toAmount, setToAmount] = useState(0); // todo
  const wallet = useSolanaWallet();
  const fromToken = associatedTokenAddress(
    new PublicKey(fromMint),
    wallet.publicKey
  );
  const toToken = associatedTokenAddress(
    new PublicKey(toMint),
    wallet.publicKey
  );

  const swapToFromMints = () => {
    setFromMintToMint([toMint, fromMint]);
  };

  const setFromMint = (mint: string) => {
    setFromMintToMint([mint, toMint]);
  };

  const setToMint = (mint: string) => {
    setFromMintToMint([fromMint, mint]);
  };

  return (
    <_SwapContext.Provider
      value={{
        fromAmount,
        setFromAmount,

        toAmount,
        setToAmount,

        fromMint,
        toMint,

        setFromMint,
        setToMint,
        swapToFromMints,

        fromToken: fromToken.toString(),
        toToken: toToken.toString(),
      }}
    >
      {props.children}
    </_SwapContext.Provider>
  );
}

export function useSwapContext(): SwapContext {
  const ctx = useContext(_SwapContext);
  if (ctx === null) {
    throw new Error("Context not available");
  }
  return ctx;
}

function associatedTokenAddress(mint: PublicKey, wallet: PublicKey): PublicKey {
  return anchor.utils.publicKey.findProgramAddressSync(
    [wallet.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  )[0];
}
