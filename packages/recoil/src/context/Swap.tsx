import React, { useContext, useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import {
  associatedTokenAddress,
  USDC_MINT,
  WSOL_MINT,
} from "@coral-xyz/common";
import { useActiveWallet, useSplTokenRegistry } from "../hooks";

const DEFAULT_SLIPPAGE_PERCENT = 1;
const DEFAULT_FEE_BPS = 0;
const JUPITER_BASE_URL = "https://quote-api.jup.ag/v1/";

type JupiterRoute = {
  amount: number;
  inAmount: number;
  otherAmountThreshold: number;
  outAmount: number;
  outAmountWithSlippage: number;
  priceImpactPct: number;
  swapMode: string;
};

type SwapContext = {
  fromAmount: number;
  setFromAmount: (a: number) => void;
  toAmount?: number;
  fromMint: string;
  setFromMint: (mint: string) => void;
  toMint: string;
  setToMint: (mint: string) => void;
  swapToFromMints: any;
  fromToken: string;
  fromMintInfo: any;
  toToken: string;
  toMintInfo: any;
  slippage: number;
  setSlippage: (s: number) => void;
  executeSwap: () => Promise<any>;
  route: JupiterRoute;
  isLoadingRoutes: boolean;
  transactions: any;
  isLoadingTransactions: boolean;
};

const _SwapContext = React.createContext<SwapContext | null>(null);

export function SwapProvider(props: any) {
  const wallet = useActiveWallet();
  const tokenRegistry = useSplTokenRegistry();
  const [[fromMint, toMint], setFromMintToMint] = useState([
    WSOL_MINT,
    USDC_MINT,
  ]);
  const fromMintPubkey = new PublicKey(fromMint);
  const toMintPubkey = new PublicKey(toMint);
  const [fromAmount, setFromAmount] = useState(0);
  const [slippage, setSlippage] = useState(DEFAULT_SLIPPAGE_PERCENT);
  const [routes, setRoutes] = useState<JupiterRoute[]>([]);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const fromToken = associatedTokenAddress(fromMintPubkey, wallet.publicKey);
  const toToken = associatedTokenAddress(toMintPubkey, wallet.publicKey);
  const feeBps = DEFAULT_FEE_BPS;
  const fromMintInfo = tokenRegistry.get(fromMintPubkey.toString())!;
  const toMintInfo = tokenRegistry.get(toMintPubkey.toString())!;
  const route = routes && routes[0];
  const toAmount = route && route.outAmount / 10 ** toMintInfo.decimals;

  useEffect(() => {
    (async () => {
      if (fromAmount > 0) {
        setRoutes(await fetchRoutes());
      } else {
        setRoutes([]);
      }
    })();
  }, [fromMint, fromAmount]);

  useEffect(() => {
    (async () => {
      if (routes.length > 0) {
        setTransactions(await fetchTransactions());
      } else {
        setTransactions([]);
      }
    })();
  }, [routes]);

  const fetchRoutes = async () => {
    setRoutes([]);
    setIsLoadingRoutes(true);
    const params = {
      inputMint: fromMint,
      outputMint: toMint,
      amount: (fromAmount * 10 ** fromMintInfo.decimals).toString(),
      slippage: slippage.toString(),
      feeBps: feeBps.toString(),
    };
    const queryString = new URLSearchParams(params).toString();
    const { data } = await (
      await fetch(`${JUPITER_BASE_URL}quote?${queryString}`)
    ).json();
    setIsLoadingRoutes(false);
    return data;
  };

  const fetchTransactions = async () => {
    setIsLoadingTransactions(true);
    const body = {
      route,
      userPublicKey: wallet.publicKey,
    };
    const transactions = await (
      await fetch(`${JUPITER_BASE_URL}swap`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })
    ).json();
    setIsLoadingTransactions(false);
    return transactions;
  };

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
    try {
      console.log("Swap transactions", transactions);
    } catch (err) {
      console.log("Swap failed", err);
    }
  };

  return (
    <_SwapContext.Provider
      value={{
        fromAmount,
        setFromAmount,
        toAmount,
        toMint,
        setToMint,
        fromMint,
        setFromMint,
        swapToFromMints,
        fromToken: fromToken.toString(),
        fromMintInfo,
        toToken: toToken.toString(),
        toMintInfo,
        slippage,
        setSlippage,
        executeSwap,
        route,
        isLoadingRoutes,
        transactions,
        isLoadingTransactions,
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
