import React, { useContext, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { JupiterProvider, useJupiter } from "@jup-ag/react-hook";
import {
  associatedTokenAddress,
  USDC_MINT,
  WSOL_MINT,
  SolanaWalletAdapter,
} from "@200ms/common";
import {
  useAnchorContext,
  useActiveWallet,
  useSplTokenRegistry,
} from "../hooks";

const DEFAULT_SLIPPAGE_PERCENT = 1;

type SwapContext = {
  fromAmount: number;
  toAmount?: number;

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

  executeSwap: () => Promise<any>;
};
const _SwapContext = React.createContext<SwapContext | null>(null);

export function SwapProvider(props: any) {
  const { connection } = useAnchorContext();
  const { publicKey } = useActiveWallet();
  return (
    <JupiterProvider
      connection={connection}
      cluster="mainnet-beta"
      userPublicKey={publicKey}
    >
      <_SwapProvider>{props.children}</_SwapProvider>
    </JupiterProvider>
  );
}

export function _SwapProvider(props: any) {
  const tokenRegistry = useSplTokenRegistry();
  const [[fromMint, toMint], setFromMintToMint] = useState([
    WSOL_MINT,
    USDC_MINT,
  ]);
  const fromMintPubkey = new PublicKey(fromMint);
  const toMintPubkey = new PublicKey(toMint);
  const [fromAmount, setFromAmount] = useState(0);
  const [slippage, setSlippage] = useState(DEFAULT_SLIPPAGE_PERCENT);
  const wallet = useActiveWallet();

  const fromMintInfo = tokenRegistry.get(fromMintPubkey.toString())!;
  const toMintInfo = tokenRegistry.get(toMintPubkey.toString())!;

  const jupiter = useJupiter({
    amount: fromAmount * 10 ** fromMintInfo.decimals,
    inputMint: fromMintPubkey,
    outputMint: toMintPubkey,
    slippage,
  });
  const routeInfo = jupiter.routes && jupiter.routes[0];

  const fromToken = associatedTokenAddress(fromMintPubkey, wallet.publicKey);
  const toToken = associatedTokenAddress(toMintPubkey, wallet.publicKey);

  const toAmount = routeInfo && routeInfo.outAmount / 10 ** toMintInfo.decimals;

  const swapToFromMints = () => {
    setFromMintToMint([toMint, fromMint]);
    setFromAmount(toAmount ?? 0);
  };

  const setFromMint = (mint: string) => {
    setFromMintToMint([mint, toMint]);
  };

  const setToMint = (mint: string) => {
    setFromMintToMint([fromMint, mint]);
  };

  const executeSwap = async () => {
    const adapter = new SolanaWalletAdapter(wallet.publicKey);

    try {
      const result = await jupiter.exchange({
        wallet: {
          publicKey: adapter.publicKey,
          sendTransaction: adapter.sendTransaction,
          signAllTransactions: adapter.signAllTransactions,
          signTransaction: adapter.signTransaction,
        },
        routeInfo: routeInfo!,
      });
      return result;
    } catch (err) {
      console.log("got swap err", err);
    }
  };

  return (
    <_SwapContext.Provider
      value={{
        fromAmount,
        toAmount,

        setFromAmount,

        fromMint,
        toMint,

        setFromMint,
        setToMint,
        swapToFromMints,

        fromToken: fromToken.toString(),
        toToken: toToken.toString(),

        slippage,
        setSlippage,

        executeSwap,
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
