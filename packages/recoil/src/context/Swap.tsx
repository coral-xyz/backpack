import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Blockchain,
  NATIVE_ACCOUNT_RENT_EXEMPTION_LAMPORTS,
  TOKEN_ACCOUNT_RENT_EXEMPTION_LAMPORTS,
} from "@coral-xyz/common";
import {
  confirmTransaction,
  generateUnwrapSolTx,
  generateWrapSolTx,
  SOL_NATIVE_MINT,
  SolanaProvider,
  USDC_MINT,
  WSOL_MINT,
} from "@coral-xyz/secure-clients/legacyCommon";
import type {
  QuoteGetRequest,
  QuoteResponse,
  SwapRequest,
  SwapResponse,
} from "@jup-ag/api";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import type { TokenInfo } from "@solana/spl-token-registry";
import { PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import { BigNumber, ethers, FixedNumber } from "ethers";

import { blockchainTokenData } from "../atoms/balance";
import {
  jupiterInputTokens,
  jupiterOutputTokens,
  jupiterTokenList as jupiterTokenListAtom,
} from "../atoms/solana/jupiter";
import { useLoader, useSolanaCtx } from "../hooks";
import type { TokenData, TokenDataWithBalance } from "../types";

const { Zero } = ethers.constants;
const DEFAULT_DEBOUNCE_DELAY = 400;
const DEFAULT_SLIPPAGE_PERCENT = 1;
// Poll for new routes every 10 seconds in case of changing market conditions
const ROUTE_POLL_INTERVAL = 10000;

export enum SwapState {
  INITIAL,
  CONFIRMATION,
  CONFIRMING,
  CONFIRMED,
  ERROR,
}

export type SwapContext = {
  // Mint settings
  fromMint: string;
  setFromMint: (mint: string) => void;
  toMint: string;
  setToMint: (mint: string) => void;
  // Swap to <-> from tokens
  swapToFromMints: () => void;
  // Token metadata
  fromTokens: Array<TokenDataWithBalance>;
  fromToken: TokenData | TokenDataWithBalance | undefined;
  toTokens: Array<TokenData>;
  toToken: TokenData | undefined;
  // Amounts
  fromAmount: BigNumber | undefined;
  setFromAmount: (a: BigNumber | undefined) => void;
  toAmount: BigNumber | undefined;
  // Slippage
  slippage: number;
  setSlippage: (s: number) => void;
  priceImpactPct: number;
  // Execute the function
  executeSwap: (confirm?: boolean) => Promise<string>;
  // Fees
  transactionFees?: {
    fees: { [label: string]: string };
    total: string;
  };
  swapFee: QuoteResponse["platformFee"];
  availableForSwap: BigNumber;
  exceedsBalance: boolean | undefined;
  feeExceedsBalance: boolean | undefined;
  // Loading flags
  isLoadingRoutes: boolean;
  isLoadingTransactions: boolean;
  isJupiterError: boolean;
  canSwap: boolean;
  canSwitch: boolean;
  isInDrawer: boolean;
  isLoading: boolean;
  setPublicKeyOverride: (pk: string | undefined) => void;
  isConfirmed: boolean;
  setIsConfirmed: (val: boolean) => void;
  errorMessage: string | null;
  setErrorMessage: (val: string | null) => void;
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
  isInDrawer = false,
  ctx = {},
}: {
  tokenAddress?: string;
  children: React.ReactNode;
  isInDrawer?: boolean;
  ctx: {
    publicKey?: string;
  };
}) {
  // Used to override the current active wallet.
  const [publicKeyOverride, setPublicKeyOverride] = useState<
    string | undefined
  >(ctx.publicKey ? ctx.publicKey : undefined);

  const blockchain = Blockchain.SOLANA; // Solana only at the moment.
  const solanaCtx = useSolanaCtx(publicKeyOverride);
  let { connection, walletPublicKey } = solanaCtx;
  walletPublicKey = publicKeyOverride
    ? new PublicKey(publicKeyOverride)
    : walletPublicKey;

  const [jupiterTokenList, jupiterTokenlistState] = useLoader(
    jupiterTokenListAtom,
    []
  );
  const JUPITER_BASE_URL = "https://jupiter.xnfts.dev/v6/";
  const [fromTokens, state] = useLoader(
    jupiterInputTokens({ publicKey: walletPublicKey.toString() }),
    []
  );
  const [token, _state] = tokenAddress
    ? // TODO: refactor so this hook isn't behind a conditional
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useLoader(
        blockchainTokenData({
          publicKey: walletPublicKey.toString(),
          blockchain,
          tokenAddress,
        }),
        undefined
      )
    : [undefined, "hasValue"];

  // Swap setttings
  const [[fromMint, toMint], setFromMintToMint] = useState([
    SOL_NATIVE_MINT,
    USDC_MINT,
  ]);
  const [fromAmount, _setFromAmount] = useState<BigNumber | undefined>(
    undefined
  );
  const [slippage, setSlippage] = useState(DEFAULT_SLIPPAGE_PERCENT);

  // Jupiter data
  const [quoteResponse, setQuoteResponse] = useState<QuoteResponse | undefined>(
    undefined
  );
  const [transaction, setTransaction] = useState<string | undefined>(undefined);
  const [transactionFees, setTransactionFees] =
    useState<SwapContext["transactionFees"]>(undefined);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Error states
  const [isJupiterError, setIsJupiterError] = useState(false);

  // Is just a wrap and not a Jupiter swap
  const isWrap = fromMint === SOL_NATIVE_MINT && toMint === WSOL_MINT;
  // Is just an unwrap and not a Jupiter swap
  const isUnwrap = fromMint === WSOL_MINT && toMint === SOL_NATIVE_MINT;
  // Is a real Jupiter swap instead of just a SOL wrap/unwrap
  const isJupiterSwap = !isWrap && !isUnwrap;

  const swapFee = quoteResponse?.platformFee;

  const toAmount = (() => {
    if (isJupiterSwap) {
      if (quoteResponse) {
        return BigNumber.from(quoteResponse.outAmount);
      } else {
        // Error case
        return undefined;
      }
    } else {
      // If not a Jupiter swap then 1:1
      return fromAmount;
    }
  })();

  // If not a Jupiter swap then no price impact
  const priceImpactPct =
    isJupiterSwap && quoteResponse ? Number(quoteResponse.priceImpactPct) : 0;

  // On changes to the swap parameters, fetch the swap routes from Jupiter.
  const pollIdRef: { current: NodeJS.Timeout | number | null } = useRef(null);

  let fromToken = fromTokens.find((t) => t.mint === fromMint);
  if (!fromToken) {
    // This can occur when the users swaps the to/from mints and the token is
    // not one that the user has a token account for
    const token = jupiterTokenList.find(
      (f: TokenInfo) => f.address === fromMint
    );
    if (token) {
      fromToken = {
        name: token.name,
        ticker: token.symbol,
        decimals: token.decimals,
        logo: token.logoURI || "",
        nativeBalance: ethers.constants.Zero,
        displayBalance: "0",
        address: token.address,
      };
    }
  } else {
    fromToken = { ...fromToken, address: fromToken.mint! };
  }

  //  const toTokens = useJupiterOutputTokens(fromMint);
  const [toTokens, toTokensState] = useLoader(
    jupiterOutputTokens({ inputMint: fromMint }),
    []
  );
  const toToken = toTokens.find((t: any) => t.mint === toMint);

  let availableForSwap = fromToken
    ? BigNumber.from(fromToken.nativeBalance)
    : Zero;

  // If from mint is native SOL, remove the transaction fee and rent exemption
  // from from the max swap amount
  if (fromMint === SOL_NATIVE_MINT && transactionFees) {
    availableForSwap = availableForSwap
      .sub(transactionFees.total)
      .sub(BigNumber.from(NATIVE_ACCOUNT_RENT_EXEMPTION_LAMPORTS));
    if (availableForSwap.lt(Zero)) {
      availableForSwap = Zero;
    }
  }

  const exceedsBalance = fromAmount
    ? fromAmount.gt(availableForSwap)
    : undefined;

  const solanaToken = fromTokens.find((t) => t.mint === SOL_NATIVE_MINT);
  const feeExceedsBalance =
    transactionFees && solanaToken
      ? BigNumber.from(transactionFees.total).gt(solanaToken.nativeBalance)
      : undefined;

  const stopRoutePolling = () => {
    if (pollIdRef.current) {
      clearInterval(pollIdRef.current);
    }
  };

  // Debounce fromAmount to avoid excessive Jupiter API requests
  const debouncedFromAmount = useDebounce(fromAmount);

  useEffect(() => {
    const defaultFromMint = token ? token.mint! : SOL_NATIVE_MINT;
    const defaultToMint = token
      ? token.mint! === USDC_MINT.toString()
        ? // wSOL for output not native SOL because the Jupiter output mint will
          // be wSOL, note this is unwrapped anyway because the `wrapUnwrapSOL`
          // parameter is set in the API call
          WSOL_MINT
        : USDC_MINT
      : USDC_MINT;

    setFromMintToMint([defaultFromMint, defaultToMint]);
  }, [token]);

  useEffect(() => {
    (async () => {
      const loadRoutes = async () => {
        if (
          fromAmount &&
          fromAmount.gt(Zero) &&
          isJupiterSwap &&
          fromMint !== toMint
        ) {
          const data = await fetchRoutes();
          setQuoteResponse(data);
          // Success, clear existing polling and setup next
          stopRoutePolling();
          const pollId = setTimeout(loadRoutes, ROUTE_POLL_INTERVAL);
          pollIdRef.current = pollId;
        } else {
          setQuoteResponse(undefined);
        }
        setIsLoadingRoutes(false);
      };
      setIsLoadingRoutes(true);
      // setIsLoadingTransactions(true); // TODO: check if this is needed
      await loadRoutes().catch((e) => {
        console.error(e);
      });
    })();
    // Cleanup
    return stopRoutePolling;
  }, [fromMint, debouncedFromAmount, toMint, isJupiterSwap]);

  //
  // On changes to the swap routes, fetch the transactions required to execute.
  //
  useEffect(() => {
    (async () => {
      const tx = await fetchTransaction();
      if (tx) {
        setTransaction(tx);
        setTransactionFees(await estimateFees(tx));
        setIsLoadingTransactions(false);
      }
    })();
  }, [quoteResponse]);

  //
  // Estimate the network fees the transactions will incur.
  //
  const estimateFees = async (transaction: string) => {
    const [solanaNetworkFee, tokenAccountCreationFee] = await Promise.all([
      (async () => {
        if (!isJupiterSwap) {
          // Simple wrap or unwrap, assume 5000
          return 5000;
        } else if (!quoteResponse || transaction === undefined) {
          // Haven't got routes yet, assume 5000 for swap
          return 5000;
        } else {
          // Estimate fees for the existing transactions by querying
          try {
            const tx = Transaction.from(Buffer.from(transaction, "base64"));
            // Under the hood this just calls connection.getFeeForMessage with
            // the message, it's a convenience method
            const fee = await tx.getEstimatedFee(connection);
            if (!fee) {
              return 5000;
            }
            return fee;
          } catch (e) {
            // Couldn't load fees, assume 5000, not worth failing over
            return 5000;
          }
        }
      })(),
      (async () => {
        try {
          if (!toMint || [SOL_NATIVE_MINT, WSOL_MINT].includes(toMint)) {
            return 0;
          }
          // if the output mint token account contains no lamports then we must create it
          else if (
            !(await connection.getBalance(
              await getAssociatedTokenAddress(
                new PublicKey(toMint),
                walletPublicKey
              )
            ))
          ) {
            return TOKEN_ACCOUNT_RENT_EXEMPTION_LAMPORTS;
          }
        } catch (err) {
          // don't throw on this until it's undergone further testing
          console.error(err);
        }
        return 0;
      })(),
    ]).catch((e) => {
      console.error(e);
      return [0, 0];
    });
    return {
      fees: {
        "Solana network": BigNumber.from(solanaNetworkFee).toString(),
        ...(tokenAccountCreationFee > 0 && {
          "One-time token account": BigNumber.from(
            tokenAccountCreationFee
          ).toString(),
        }),
      },
      total: BigNumber.from(
        solanaNetworkFee + tokenAccountCreationFee
      ).toString(),
    };
  };

  //
  // Fetch the Jupiter routes that can be used to execute the swap.
  //
  const fetchRoutes = async () => {
    if (!fromAmount) return undefined;
    const params = {
      // If the swap is to or from native SOL we want Jupiter to return wSOL
      // routes because it does not support native SOL routes.
      inputMint: fromMint === SOL_NATIVE_MINT ? WSOL_MINT : fromMint,
      outputMint: toMint === SOL_NATIVE_MINT ? WSOL_MINT : toMint,
      amount: fromAmount.toString() as unknown as number,
      slippageBps: (slippage * 100).toString() as unknown as number,
      // As ledger wallet does not support v0 yet and we don't want to handle the fallback we request a v0 tx
      // asLegacyTransaction: "true" as unknown as boolean,
    } as QuoteGetRequest;
    const queryString = new URLSearchParams(
      params as unknown as Record<string, string>
    ).toString();
    try {
      const response = await fetch(`${JUPITER_BASE_URL}quote?${queryString}`);
      if (!response.ok) {
        // fetch throws for network errors but http status code errors so throw
        // manually if status code is outside of 200-299 range
        throw new Error(response.status.toString());
      }
      const data = (await response.json()) as QuoteResponse;
      setIsJupiterError(false);
      return data;
    } catch (e) {
      console.error("error fetching swap routes", e);
      setIsJupiterError(true);
      return undefined;
    }
  };

  //
  // Load the transactions required to execute the swap.
  //
  const fetchTransaction = async () => {
    if (!fromAmount) return undefined;
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
    } else if (isJupiterSwap && quoteResponse) {
      // Jupiter swap. Although Jupiter can return between 1 and 3 transactions
      // to perform a swap, we should only ever get one as we are using the
      // onlyDirectRoutes parameter.
      const response = await fetch(`${JUPITER_BASE_URL}swap`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quoteResponse,
          wrapAndUnwrapSol: true,
          userPublicKey: String(walletPublicKey),
          // asLegacyTransaction: false,
        } as SwapRequest),
      });
      const swapResult = (await response.json()) as SwapResponse;
      return swapResult.swapTransaction;
    } else {
      return undefined;
    }
  };

  //
  // Switch the trade direction.
  //
  const swapToFromMints = () => {
    if (fromMint === SOL_NATIVE_MINT) {
      setFromMintToMint([toMint, WSOL_MINT]);
    } else if (toMint === WSOL_MINT) {
      setFromMintToMint([SOL_NATIVE_MINT, fromMint]);
    } else {
      setFromMintToMint([toMint, fromMint]);
    }
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
  const executeSwap = async (confirm = true) => {
    if (!toAmount || !transaction) throw new Error("Error");

    if (isConfirmed) setIsConfirmed(false);
    if (errorMessage) setErrorMessage(null);

    const signature = await sendTransaction(transaction);

    // Stop polling route updates when swap transaction is finalised
    stopRoutePolling();

    if (confirm) {
      await confirmTransaction(solanaCtx.connection, signature, "confirmed");
      setIsConfirmed(true);
    }

    return signature;
  };

  const sendTransaction = async (serializedTransaction: string) => {
    const decimalDifference = fromToken!.decimals - toToken.decimals;

    // Scale a FixedNumber up or down by a number of decimals
    const scale = (x: FixedNumber, decimalDifference: number) => {
      if (decimalDifference > 0) {
        return x.mulUnsafe(FixedNumber.from(10 ** decimalDifference));
      } else if (decimalDifference < 0) {
        return x.divUnsafe(FixedNumber.from(10 ** Math.abs(decimalDifference)));
      }
      return x;
    };

    const rate = fromAmount!.gt(Zero)
      ? ethers.utils.commify(
          scale(
            FixedNumber.from(toAmount).divUnsafe(FixedNumber.from(fromAmount)),
            decimalDifference
          ).toString()
        )
      : "0";

    const priceImpact = !priceImpactPct
      ? "0"
      : priceImpactPct > 0.1
      ? priceImpactPct.toFixed(2)
      : "< 0.1";

    const buf = Buffer.from(serializedTransaction, "base64");

    const legacyOrVersionedTransaction = (() => {
      try {
        return VersionedTransaction.deserialize(buf);
      } catch (err) {
        return Transaction.from(buf);
      }
    })();

    const signature = await SolanaProvider.signAndSendTransaction(
      solanaCtx,
      legacyOrVersionedTransaction,
      {
        type: "SWAP_TOKENS",
        toToken: toToken.mint!.toString(),
        toAmount: toAmount!.toString(),
        fromToken: fromToken!.address.toString(),
        fromAmount: fromAmount!.toString(),
        backpackFeePercent: swapFee?.feeBps ? swapFee.feeBps / 100 : 0,
        transactionFees: transactionFees!,
        priceImpact,
        rate,
        expirationTimeMs: 20_000,
      }
    );

    return signature;
  };

  // Only allow users to switch input and output tokens if they currently
  // have a balance of the output token
  const canSwitch =
    toToken?.mint === WSOL_MINT || fromTokens.some((t) => t.mint === toMint);

  return (
    <_SwapContext.Provider
      value={{
        toMint,
        setToMint,
        fromMint,
        fromTokens,
        fromToken,
        toTokens,
        toToken,
        setFromMint,
        fromAmount,
        // @ts-ignore
        setFromAmount,
        toAmount,
        swapToFromMints,
        slippage,
        setSlippage,
        executeSwap,
        priceImpactPct,
        isLoadingRoutes,
        isLoadingTransactions,
        transactionFees,
        swapFee,
        isJupiterError,
        availableForSwap,
        exceedsBalance,
        feeExceedsBalance,
        canSwap: !availableForSwap.isZero(),
        canSwitch,
        isInDrawer,
        isLoading:
          state === "loading" ||
          _state === "loading" ||
          jupiterTokenlistState === "loading" ||
          toTokensState === "loading" ||
          isLoadingRoutes ||
          isLoadingTransactions,
        setPublicKeyOverride,
        isConfirmed,
        setIsConfirmed,
        errorMessage,
        setErrorMessage,
      }}
    >
      {children}
    </_SwapContext.Provider>
  );
}

export function useSwapContext(): SwapContext {
  const ctx = useContext(_SwapContext);
  if (ctx === null) {
    throw new Error("useSwapContext must be used within a SwapProvider");
  }
  return ctx;
}
