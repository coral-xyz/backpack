import * as bs58 from "bs58";
import React, { useContext, useEffect, useState, useRef } from "react";
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  associatedTokenAddress,
  confirmTransaction,
  generateWrapSolTx,
  generateUnwrapSolTx,
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
  wrapTransaction?: string;
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
  priceImpactPct: number;
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
  const solanaCtx = useSolanaCtx();
  const { connection } = solanaCtx;
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

  const isWrapUnwrap =
    fromMint === (SOL_NATIVE_MINT || WSOL_MINT) &&
    toMint === (SOL_NATIVE_MINT || WSOL_MINT);

  const route = routes && routes[0];

  // If wrapping/unwrapping then same to/from amounts
  const toAmount = isWrapUnwrap
    ? fromAmount
      ? fromAmount
      : undefined
    : route && route.outAmount / 10 ** toMintInfo.decimals;

  // If wrapping/unwrapping then no price impact
  const priceImpactPct = isWrapUnwrap ? 0 : route && route.priceImpactPct;

  //
  // On changes to the swap parameters, fetch the swap routes from Jupiter.
  //
  const pollIdRef: { current: NodeJS.Timeout | null } = useRef(null);

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

  //
  // On changes to the swap routes, fetch the transactions required to execute.
  //
  useEffect(() => {
    (async () => {
      if (routes && routes.length > 0 && !isLoadingRoutes) {
        setTransactions(await fetchTransactions());
      } else {
        setTransactions(null);
      }
    })();
  }, [routes]);

  //
  // On changes to the swap transactions, recalculate the network fees.
  //
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

  //
  // Fetch the Jupiter routes that can be used to execute the swap.
  //
  const fetchRoutes = async () => {
    setRoutes([]);
    // Wrapping/unwrapping, no need to fetch routes
    if (isWrapUnwrap) return;
    setIsLoadingRoutes(true);
    const params = {
      // If the swap is to or from native SOL we want Jupiter to return wSOL
      // routes because it does not support native SOL routes.
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

  //
  // Load the transactions required to execute the swap.
  //
  const fetchTransactions = async () => {
    setIsLoadingTransactions(true);
    //
    // wrapUnableSOL is disabled, so handle wrapping and unwrapping
    let wrapTransaction: string | undefined = undefined;
    let unwrapTransaction: string | undefined = undefined;
    if (fromMint === SOL_NATIVE_MINT) {
      // Swapping from native SOL, need to wrap the equivalent amount
      wrapTransaction = (
        await generateWrapSolTx(
          solanaCtx,
          wallet.publicKey,
          fromAmount! * 10 ** 9
        )
      ).toString("base64");
      if (toMint === WSOL_MINT) {
        // This is not a real swap, we are just wrapping SOL so use the wrap
        // transaction as the main swap
        return {
          swapTransaction: wrapTransaction,
        };
      }
    }
    if (toMint === SOL_NATIVE_MINT) {
      // To mint is native Solana, so we need to unwrap wSOL in our cleanup
      unwrapTransaction = (
        await generateUnwrapSolTx(
          solanaCtx,
          wallet.publicKey,
          toAmount! * 10 ** 9
        )
      ).toString("base64");

      if (fromMint === WSOL_MINT) {
        // This is not a real swap, we are just unwrapping SOL so use the unwrap
        // transaction as the main swap
        return {
          swapTransaction: unwrapTransaction,
        };
      }
    }
    const jupiterTransactions = await (
      await fetch(`${JUPITER_BASE_URL}swap`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route,
          wrapUnwrapSOL: false,
          userPublicKey: wallet.publicKey,
        }),
      })
    ).json();

    setIsLoadingTransactions(false);

    const transactions = {
      ...(wrapTransaction !== undefined && { wrapTransaction }),
      ...jupiterTransactions,
      // Jupiter should not return cleanup transactions with wrapUnwrapSOL set
      // to false, we set it to our own cleanup transaction
      ...(unwrapTransaction !== undefined && {
        cleanupTransaction: unwrapTransaction,
      }),
    };
    return transactions;
  };

  //
  // Estimate the network fees the transactions will incur.
  //
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

  //
  // Switch the trade direction.
  //
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

  //
  // Execute the transactions to perform the swap.
  //
  // The Jupiter API returns between 1 and 3 transations to perform a swap
  // (setupTransaction, swapTransaction, cleanupTransaction). Additionally
  // the wrapping of SOL (if required) is handled here by the wrapTransaction
  // step at the beginning.
  //
  // Jupiter does offer an API parameter to handle wrapping and unwrapping of
  // SOL but it is not used because it is difficult to ensure that the users
  // wSOL account and balance are retained.
  //
  // TODO: can we put our wrapping/unwrapping instructions in the returned Jupiter
  // transactions to cut down on the number of transactions needed?
  //
  const executeSwap = async () => {
    if (!transactions) {
      console.log("no transactions found to execute swap");
      return null;
    }

    // Stop polling for route updates when swap is finalised
    stopRoutePolling();
    for (const transactionStep of [
      "wrapTransaction",
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
          console.log("swap error at", transactionStep, e);
          if (
            ["wrapTransaction", "setupTransaction"].includes(transactionStep)
          ) {
            // Failure in one of the setup transactions, irrecoverable
            return false;
          } else if (transactionStep === "swapTransaction") {
            // Setup transaction didn't exist or suceeded, so update the
            // transactions required to execute to only the remaining
            // transactions so the user can retry (i.e. exclude setup transactions)
            const { swapTransaction, cleanupTransaction } = transactions;
            setTransactions({
              swapTransaction,
              ...(cleanupTransaction !== undefined && { cleanupTransaction }),
            });
            return false;
          } else if (transactionStep === "cleanupTransaction") {
            // Failed on cleanup, we still want to display a success message
            // to the user here as the swap has completed. The cleanup step
            // was unwrapping SOL.
            // TODO: handle this somehow?
            console.warn("swap cleanup failed");
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
        priceImpactPct,
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
