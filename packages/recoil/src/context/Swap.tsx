import * as bs58 from "bs58";
import React, { useContext, useEffect, useState } from "react";
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  associatedTokenAddress,
  confirmTransaction,
  USDC_MINT,
  WSOL_MINT,
  UI_RPC_METHOD_SIGN_AND_SEND_TRANSACTION,
} from "@coral-xyz/common";
import {
  useActiveWallet,
  useBackgroundClient,
  useSplTokenRegistry,
} from "../hooks";
import { useSolanaCtx } from "../hooks/useSolanaConnection";
import { JUPITER_BASE_URL } from "../atoms/solana/jupiter";

const DEFAULT_SLIPPAGE_PERCENT = 1;

type JupiterRoute = {
  amount: number;
  inAmount: number;
  otherAmountThreshold: number;
  outAmount: number;
  outAmountWithSlippage: number;
  priceImpactPct: number;
  swapMode: string;
};

type JupiterTransactions = {
  setupTransaction?: string;
  swapTransaction: string;
  cleanupTransaction?: string;
};

type SwapContext = {
  fromAmount: number | null;
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
  transactions: any;
  transactionFee: any;
  isLoadingRoutes: boolean;
  isLoadingTransactions: boolean;
  isLoadingTransactionFee: boolean;
};

const _SwapContext = React.createContext<SwapContext | null>(null);

export function SwapProvider(props: any) {
  const wallet = useActiveWallet();
  const tokenRegistry = useSplTokenRegistry();
  const { connection } = useSolanaCtx();
  const background = useBackgroundClient();

  const [[fromMint, toMint], setFromMintToMint] = useState([
    WSOL_MINT,
    USDC_MINT,
  ]);
  const fromMintPubkey = new PublicKey(fromMint);
  const toMintPubkey = new PublicKey(toMint);
  const [fromAmount, setFromAmount] = useState<number | null>(null);
  const [slippage, setSlippage] = useState(DEFAULT_SLIPPAGE_PERCENT);
  const [routes, setRoutes] = useState<JupiterRoute[]>([]);
  const [transactions, setTransactions] = useState<JupiterTransactions | null>(
    null
  );
  const [transactionFee, setTransactionFee] = useState<number | null>(null);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [isLoadingTransactionFee, setIsLoadingTransactionFee] = useState(false);

  const fromToken = associatedTokenAddress(fromMintPubkey, wallet.publicKey);
  const toToken = associatedTokenAddress(toMintPubkey, wallet.publicKey);
  const fromMintInfo = tokenRegistry.get(fromMintPubkey.toString())!;
  const toMintInfo = tokenRegistry.get(toMintPubkey.toString())!;

  const route = routes && routes[0];
  const toAmount = route && route.outAmount / 10 ** toMintInfo.decimals;

  useEffect(() => {
    (async () => {
      if (fromAmount && fromAmount > 0) {
        setRoutes(await fetchRoutes());
      } else {
        setRoutes([]);
      }
    })();
  }, [fromMint, fromAmount, toMint]);

  useEffect(() => {
    (async () => {
      if (routes.length > 0) {
        setTransactions(await fetchTransactions());
      } else {
        setTransactions(null);
      }
    })();
  }, [routes]);

  useEffect(() => {
    (async () => {
      setTransactionFee(null);
      if (transactions && Object.keys(transactions).length > 0) {
        setIsLoadingTransactionFee(true);
        setTransactionFee(await calculateTransactionFee());
        setIsLoadingTransactionFee(false);
      }
    })();
  }, [transactions]);

  const fetchRoutes = async () => {
    setRoutes([]);
    setIsLoadingRoutes(true);
    const params = {
      inputMint: fromMint,
      outputMint: toMint,
      amount: (fromAmount! * 10 ** fromMintInfo.decimals).toString(),
      slippage: slippage.toString(),
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
      wrapUnwrapSOL: false,
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

  const calculateTransactionFee = async () => {
    let fee = 0;
    if (!transactions) return null;
    for (const serializedTransaction of Object.values(transactions)) {
      const transaction = Transaction.from(
        Buffer.from(serializedTransaction, "base64")
      );
      // Under the hood this just calls connection.getFeeForMessage with
      // the message, it's a convenience method
      try {
        fee += await transaction.getEstimatedFee(connection);
      } catch (e) {
        // TODO errors here for connection unavailable intermittently, why?
        console.log("could not retrieve transaction fee", e);
        return null;
      }
    }
    return fee;
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
    if (!transactions) return null;
    for (const transactionStep of [
      "setupTransaction",
      "swapTransaction",
      "cleanupTransaction",
    ]) {
      const serializedTransaction = transactions[transactionStep];
      if (serializedTransaction) {
        try {
          const signature = await background.request({
            method: UI_RPC_METHOD_SIGN_AND_SEND_TRANSACTION,
            params: [
              bs58.encode(Buffer.from(serializedTransaction, "base64")),
              wallet.publicKey,
            ],
          });
          await confirmTransaction(connection, signature, "confirmed");
        } catch (e) {
          console.log("swap error", e);
          if (transactionStep === "setupTransaction") {
            return false;
          } else if (transactionStep === "swapTransaction") {
            // Setup transaction didn't exist or suceeded, so update the
            // transactions required to execute to only the remaining
            // transactions so the user can retry
            const { setupTransaction, ...rest } = transactions;
            setTransactions(rest);
          } else if (transactionStep === "cleanupTransaction") {
            // Failed on cleanup, we still want to display a success message
            // to the user here as the swap has completed. The cleanup step
            // was likely removing a wSOL account and so is relatively
            // inconsequential.
            // TODO - handle this somehow?
            return true;
          }
        }
      }
    }
    // All transactions successful
    return true;
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
        transactionFee,
        isLoadingTransactionFee,
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
