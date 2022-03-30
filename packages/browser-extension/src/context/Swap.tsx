import React, { useContext, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useActiveWallet } from "../hooks/useWallet";
import {
  associatedTokenAddress,
  USDC_MINT,
  WSOL_MINT,
} from "../common/solana/programs/token";

const DEFAULT_SLIPPAGE_PERCENT = 0.5;

type SwapContext = {
  fromAmount: number;
  toAmount: number;

  setToAmount: (a: number) => void;
  setFromAmount: (a: number) => void;

  fromMint: string;
  toMint: string;

  setToMint: (mint: string) => void;
  setFromMint: (mint: string) => void;
  swapToFromMints: any;

  fromToken: string;
  toToken: string;

  slippage: number;
  setSlippage: (s: number) => void;
};
const _SwapContext = React.createContext<SwapContext | null>(null);

export function SwapProvider(props: any) {
  const [[fromMint, toMint], setFromMintToMint] = useState([
    WSOL_MINT,
    USDC_MINT,
  ]);
  const [[fromAmount, toAmount], setFromAmountToAmount] = useState([0, 0]); // todo
  const [slippage, setSlippage] = useState(DEFAULT_SLIPPAGE_PERCENT);
  const wallet = useActiveWallet();
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
    setFromAmountToAmount([toAmount, fromAmount]);
  };

  const setFromAmount = (amount: number) => {
    setFromAmountToAmount([amount, toAmount]);
  };

  const setToAmount = (amount: number) => {
    setFromAmountToAmount([fromAmount, amount]);
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
        toAmount,

        setFromAmount,
        setToAmount,

        fromMint,
        toMint,

        setFromMint,
        setToMint,
        swapToFromMints,

        fromToken: fromToken.toString(),
        toToken: toToken.toString(),

        slippage,
        setSlippage,
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
