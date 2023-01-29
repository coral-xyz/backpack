import React, { useContext, useEffect, useRef, useState } from "react";
import {
  associatedTokenAddress,
  BACKPACK_FEATURE_REFERRAL_FEES,
  Blockchain,
  confirmTransaction,
  generateUnwrapSolTx,
  generateWrapSolTx,
  NATIVE_ACCOUNT_RENT_EXEMPTION_LAMPORTS,
  SOL_NATIVE_MINT,
  UI_RPC_METHOD_SOLANA_SIGN_AND_SEND_TRANSACTION,
  USDC_MINT,
  WSOL_MINT,
} from "@coral-xyz/common";
import { PublicKey, Transaction } from "@solana/web3.js";
import * as bs58 from "bs58";
import { BigNumber, ethers } from "ethers";

import { blockchainTokenData } from "../atoms/balance";
import { JUPITER_BASE_URL, jupiterInputMints } from "../atoms/solana/jupiter";
import { useLoader, useSolanaCtx, useSplTokenRegistry } from "../hooks";

const { Zero } = ethers.constants;
const DEFAULT_DEBOUNCE_DELAY = 400;
const DEFAULT_SLIPPAGE_PERCENT = 1;
// Poll for new routes every 30 seconds in case of changing market conditions
const ROUTE_POLL_INTERVAL = 30000;

type JupiterRoute = {
  amount: string;
  inAmount: string;
  otherAmountThreshold: string;
  outAmount: string;
  // deprecated field
  outAmountWithSlippage: string;
  priceImpactPct: number;
  swapMode: string;
};

type SwapContext = {
  fromAmount: BigNumber | undefined;
  setFromAmount: (a: BigNumber | undefined) => void;
  toAmount: BigNumber | undefined;
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
  transactionFee: BigNumber | undefined;
  swapFee: BigNumber;
  isLoadingRoutes: boolean;
  isLoadingTransactions: boolean;
  isJupiterError: boolean;
  availableForSwap: BigNumber;
  exceedsBalance: boolean | undefined;
  feeExceedsBalance: boolean | undefined;
  inputTokenAccounts: any;
};

const _SwapContext = React.createContext<SwapContext | null>(null);

function useDebounce(value: any, wait = DEFAULT_DEBOUNCE_DELAY) {
  const [debounceValue, setDebounceValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounceValue(value);
    }, wait);
    return () => clearTimeout(timer); // cleanup when unmounted
  }, [value, wait]);

  return debounceValue;
}

export function SwapProvider({
  tokenAddress,
  children,
}: {
  tokenAddress?: string;
  children: React.ReactNode;
}) {
  const tokenRegistry = useSplTokenRegistry();
  const blockchain = Blockchain.SOLANA; // Solana only at the moment.
  const solanaCtx = useSolanaCtx();
  const { backgroundClient, connection, walletPublicKey } = solanaCtx;
  const [inputTokenAccounts] = useLoader(
    jupiterInputMints({ publicKey: walletPublicKey.toString() }),
    []
  );

  const [token] = tokenAddress
    ? useLoader(
        blockchainTokenData({
          publicKey: walletPublicKey.toString(),
          blockchain,
          tokenAddress,
        }),
        undefined
      )
    : [undefined];

  // Swap setttings
  const [[fromMint, toMint], setFromMintToMint] = useState([
    token ? token.mint! : SOL_NATIVE_MINT,
    token
      ? token.mint! === USDC_MINT.toString()
        ? SOL_NATIVE_MINT
        : USDC_MINT
      : USDC_MINT,
  ]);
  const [fromAmount, _setFromAmount] = useState<BigNumber | undefined>(
    undefined
  );
  const [slippage, setSlippage] = useState(DEFAULT_SLIPPAGE_PERCENT);

  // Jupiter data
  const [routes, setRoutes] = useState<JupiterRoute[]>([]);

  const [transaction, setTransaction] = useState<string | undefined>(undefined);
  const [transactionFee, setTransactionFee] = useState<BigNumber | undefined>(
    undefined
  );
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  // Error states
  const [isJupiterError, setIsJupiterError] = useState(false);

  const fromToken = associatedTokenAddress(
    new PublicKey(fromMint),
    walletPublicKey
  );
  const toToken = associatedTokenAddress(
    new PublicKey(toMint),
    walletPublicKey
  );
  const fromMintInfo = tokenRegistry.get(fromMint)!;
  const toMintInfo = tokenRegistry.get(toMint)!;

  // Is just a wrap and not a Jupiter swap
  const isWrap = fromMint === SOL_NATIVE_MINT && toMint === WSOL_MINT;
  // Is just an unwrap and not a Jupiter swap
  const isUnwrap = fromMint === WSOL_MINT && toMint === SOL_NATIVE_MINT;
  // Is a real Jupiter swap instead of just a SOL wrap/unwrap
  const isJupiterSwap = !isWrap && !isUnwrap;

  const route = routes && routes[0];
  // If not a Jupiter swap then 1:1
  const toAmount = isJupiterSwap
    ? route && BigNumber.from(route.outAmount)
    : fromAmount;
  // If not a Jupiter swap then no price impact
  const priceImpactPct = isJupiterSwap ? route && route.priceImpactPct : 0;

  //
  // On changes to the swap parameters, fetch the swap routes from Jupiter.
  //
  const pollIdRef: { current: NodeJS.Timeout | null } = useRef(null);

  const swapFromToken = inputTokenAccounts.find((t) => t.mint === fromMint);

  let availableForSwap = swapFromToken
    ? BigNumber.from(swapFromToken.nativeBalance)
    : Zero;

  // If from mint is native SOL, remove the transaction fee and rent exemption
  // from from the max swap amount
  if (fromMint === SOL_NATIVE_MINT && transactionFee) {
    availableForSwap = availableForSwap
      .sub(transactionFee)
      .sub(BigNumber.from(NATIVE_ACCOUNT_RENT_EXEMPTION_LAMPORTS));
    if (availableForSwap.lt(Zero)) {
      availableForSwap = Zero;
    }
  }

  const exceedsBalance = fromAmount
    ? fromAmount.gt(availableForSwap)
    : undefined;

  const solanaToken = inputTokenAccounts.find(
    (t) => t.mint === SOL_NATIVE_MINT
  );

  const feeExceedsBalance =
    transactionFee && solanaToken
      ? transactionFee.gt(solanaToken.nativeBalance)
      : undefined;

  const stopRoutePolling = () => {
    if (pollIdRef.current) {
      clearInterval(pollIdRef.current);
    }
  };

  // Debounce fromAmount to avoid excessive Jupiter API requests
  const debouncedFromAmount = useDebounce(fromAmount);

  useEffect(() => {
    const loadRoutes = async () => {
      if (
        fromAmount &&
        fromAmount.gt(Zero) &&
        isJupiterSwap &&
        fromMint !== toMint
      ) {
        setRoutes(await fetchRoutes());
        // Success, clear existing polling and setup next
        stopRoutePolling();
        const pollId = setTimeout(loadRoutes, ROUTE_POLL_INTERVAL);
        pollIdRef.current = pollId;
      } else {
        setRoutes([]);
      }
      setIsLoadingRoutes(false);
    };
    setIsLoadingRoutes(true);
    setIsLoadingTransactions(true);
    loadRoutes();
    // Cleanup
    return stopRoutePolling;
  }, [fromMint, debouncedFromAmount, toMint, isJupiterSwap]);

  //
  // On changes to the swap routes, fetch the transactions required to execute.
  //
  useEffect(() => {
    (async () => {
      const transaction = await fetchTransaction();
      setTransaction(transaction);
      setTransactionFee(await estimateFee(transaction));
      setIsLoadingTransactions(false);
    })();
  }, [routes]);

  //
  // Estimate the network fees the transactions will incur.
  //
  const estimateFee = async (transaction: string) => {
    let fee = 0;
    if (!isJupiterSwap) {
      // Simple wrap or unwrap, assume 5000
      fee += 5000;
    } else if (!routes || routes.length === 0 || transaction === undefined) {
      // Haven't got routes yet, assume 5000 for swap
      fee += 5000;
    } else {
      // Estimate fees for the existing transactions by querying
      try {
        const tx = Transaction.from(Buffer.from(transaction, "base64"));
        // Under the hood this just calls connection.getFeeForMessage with
        // the message, it's a convenience method
        fee += await tx.getEstimatedFee(connection);
      } catch (e) {
        // Couldn't load fees, assume 5000, not worth failing over
        fee = 5000;
      }
    }
    return BigNumber.from(fee);
  };

  //
  // Fetch the Jupiter routes that can be used to execute the swap.
  //
  const fetchRoutes = async () => {
    if (!fromAmount) return [];
    const params = {
      // If the swap is to or from native SOL we want Jupiter to return wSOL
      // routes because it does not support native SOL routes.
      inputMint: fromMint === SOL_NATIVE_MINT ? WSOL_MINT : fromMint,
      outputMint: toMint === SOL_NATIVE_MINT ? WSOL_MINT : toMint,
      amount: fromAmount.toString(),
      slippageBps: (slippage * 100).toString(),
      // As ledger wallet does not support v0 yet and we don't want to handle the fallback we request a v0 tx
      asLegacyTransaction: "true",
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
    }
  };

  //
  // Load the transactions required to execute the swap.
  //
  const fetchTransaction = async () => {
    if (!fromAmount) return {};
    if (isWrap) {
      // Just a wrapping of SOL
      return (
        await generateWrapSolTx(
          solanaCtx,
          walletPublicKey,
          fromAmount!.toNumber()
        )
      ).toString("base64");
    } else if (isUnwrap) {
      // Just an unwrapping of SOL
      return (
        await generateUnwrapSolTx(
          solanaCtx,
          walletPublicKey,
          fromAmount!.toNumber()
        )
      ).toString("base64");
    } else if (isJupiterSwap && routes && routes.length > 0) {
      // Jupiter swap. Although Jupiter can return between 1 and 3 transactions
      // to perform a swap, we should only ever get one as we are using the
      // onlyDirectRoutes parameter.
      const response = await fetch(`${JUPITER_BASE_URL}swap`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route,
          wrapUnwrapSOL: true,
          userPublicKey: walletPublicKey,
          asLegacyTransaction: true,
        }),
      });
      const swapResult = await response.json();
      return swapResult["swapTransaction"];
    }
  };

  //
  // Switch the trade direction.
  //
  const swapToFromMints = () => {
    setFromMintToMint([toMint, fromMint]);
    setFromAmount(toAmount ?? Zero);
  };

  const setFromMint = (mint: string) => {
    setFromMintToMint([mint, toMint]);
  };

  const setToMint = (mint: string) => {
    setFromMintToMint([fromMint, mint]);
  };

  const setFromAmount = (amount: BigNumber) => {
    // Restrict the input to the number of decimals of the from token
    _setFromAmount(amount);
  };

  //
  // Execute the transactions to perform the swap.
  //
  const executeSwap = async () => {
    if (!toAmount) return;
    if (!transaction) return;

    // Stop polling for route updates when swap is finalised
    stopRoutePolling();
    try {
      const signature = await sendAndConfirmTransaction(transaction);

      if (BACKPACK_FEATURE_REFERRAL_FEES) {
        try {
          await fetch("https://jupiter.xnfts.dev/swap", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              signature,
            }),
          });
        } catch (e) {
          //  do nothing as we don't want to block the UI if it fails
        }
      }
    } catch (e) {
      console.log("swap error", e);
      return false;
    }

    return true;
  };

  const sendAndConfirmTransaction = async (serializedTransaction: string) => {
    const signature = await backgroundClient.request({
      method: UI_RPC_METHOD_SOLANA_SIGN_AND_SEND_TRANSACTION,
      params: [
        bs58.encode(Buffer.from(serializedTransaction, "base64")),
        walletPublicKey,
      ],
    });
    await confirmTransaction(connection, signature, "confirmed");
    return signature;
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
        isLoadingTransactions,
        transactionFee,
        // TODO backpack fees
        swapFee: Zero,
        isJupiterError,
        availableForSwap,
        exceedsBalance,
        feeExceedsBalance,
        inputTokenAccounts,
      }}
    >
      {children}
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
