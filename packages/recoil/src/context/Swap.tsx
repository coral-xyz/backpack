import * as bs58 from "bs58";
import React, { useContext, useEffect, useState, useRef } from "react";
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  associatedTokenAddress,
  confirmTransaction,
  SOL_NATIVE_MINT,
  USDC_MINT,
  WSOL_MINT,
  UI_RPC_METHOD_SIGN_AND_SEND_TRANSACTION,
} from "@coral-xyz/common";
import {
  useActiveWallet,
  useBackgroundClient,
  useSplTokenRegistry,
  useSolanaCtx,
} from "../hooks";
import { JUPITER_BASE_URL } from "../atoms/solana/jupiter";

const DEFAULT_SLIPPAGE_PERCENT = 1;
// Poll for new routes every 30 seconds in case of changing market conditions
const ROUTE_POLL_INTERVAL = 30000;

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
  isJupiterError: boolean;
};

const _SwapContext = React.createContext<SwapContext | null>(null);

export function SwapProvider(props: any) {
  const wallet = useActiveWallet();
  const tokenRegistry = useSplTokenRegistry();
  const { connection } = useSolanaCtx();
  const background = useBackgroundClient();

  // Swap setttings
  const [[fromMint, toMint], setFromMintToMint] = useState([
    SOL_NATIVE_MINT,
    USDC_MINT,
  ]);
  const [fromAmount, setFromAmount] = useState<number | null>(null);
  const [slippage, setSlippage] = useState(DEFAULT_SLIPPAGE_PERCENT);

  // Jupiter data
  const [routes, setRoutes] = useState<JupiterRoute[]>([]);
  const [transactions, setTransactions] = useState<JupiterTransactions | null>(
    null
  );
  const [transactionFee, setTransactionFee] = useState<number | null>(null);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [isLoadingTransactionFee, setIsLoadingTransactionFee] = useState(false);

  // Error states
  const [isJupiterError, setIsJupiterError] = useState(false);

  const fromToken = associatedTokenAddress(
    new PublicKey(fromMint),
    wallet.publicKey
  );
  const toToken = associatedTokenAddress(
    new PublicKey(toMint),
    wallet.publicKey
  );
  const fromMintInfo = tokenRegistry.get(fromMint)!;
  const toMintInfo = tokenRegistry.get(toMint)!;

  const route = routes && routes[0];
  const toAmount = route && route.outAmount / 10 ** toMintInfo.decimals;

  const pollIdRef: { current: NodeJS.Timeout | null } = useRef(null);

  // If swapping from or to native SOL, auto wrap and unwrap
  const wrapUnwrapSOL =
    fromMint === SOL_NATIVE_MINT || toMint === SOL_NATIVE_MINT;

  const stopRoutePolling = () => {
    if (pollIdRef.current) {
      clearInterval(pollIdRef.current);
    }
  };

  useEffect(() => {
    const loadRoutes = async () => {
      if (fromAmount && fromAmount > 0) {
        setRoutes(await fetchRoutes());
        // Success, clear existing polling and setup next
        stopRoutePolling();
        const pollId = setTimeout(loadRoutes, ROUTE_POLL_INTERVAL);
        pollIdRef.current = pollId;
      } else {
        setRoutes([]);
      }
    };
    loadRoutes();
    // Cleanup
    return stopRoutePolling;
  }, [fromMint, fromAmount, toMint]);

  useEffect(() => {
    (async () => {
      if (routes && routes.length > 0 && !isLoadingRoutes) {
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
      // If the swap is to or from native SOL we want Jupiter to return wSOL
      // routes because it does not support native SOL routes, but it can auto
      // wrap and unwrap native SOL for a wSOL route.
      inputMint: fromMint === SOL_NATIVE_MINT ? WSOL_MINT : fromMint,
      outputMint: toMint === SOL_NATIVE_MINT ? WSOL_MINT : toMint,
      amount: (fromAmount! * 10 ** fromMintInfo.decimals).toString(),
      slippage: slippage.toString(),
    };
    const queryString = new URLSearchParams(params).toString();
    try {
      const response = await fetch(`${JUPITER_BASE_URL}quote?${queryString}`);
      if (!response.ok) {
        // fetch throws for network errors but http status code errors so throw
        // manually if status code is outside of 200-299 range
        throw new Error(response.status.toString());
      }
      const { data } = await response.json();
      setIsJupiterError(false);
      return data;
    } catch (e) {
      console.error("error fetching swap routes", e);
      setIsJupiterError(true);
      return [];
    } finally {
      setIsLoadingRoutes(false);
    }
  };

  const fetchTransactions = async () => {
    setIsLoadingTransactions(true);
    const body = {
      route,
      wrapUnwrapSOL,
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
    // Stop polling for route updates when swap is finalised
    stopRoutePolling();
    if (!transactions) return null;
    for (const transactionStep of [
      "setupTransaction",
      "swapTransaction",
      "cleanupTransaction",
    ]) {
      if (wrapUnwrapSOL) {
        // From or to mint is native SOL and so auto wrap and unwrap is enabled.
        // This means that the users existing wSOL account (if any) may be
        // closed. This isn't necessarily part of the cleanup transaction, it
        // can also happen in the main swap. To handle this we need to recreate
        // the wSOL account with the pre-swap balance.
        console.warn("TODO recreate wSOL account and balance");
      }
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
            return false;
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
        isJupiterError,
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
