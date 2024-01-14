/*
 * This file contains all the hooks that generalize over blockchains.
 * Adding a blockchain to the swapper should entail adding cases here.
 *
 * Note: not completely done.
 */
import { useCallback, useMemo, useState } from "react";
import { useApolloClient, useLazyQuery, useQuery } from "@apollo/client";
import {
  Blockchain,
  NATIVE_ACCOUNT_RENT_EXEMPTION_LAMPORTS,
  TOKEN_ACCOUNT_RENT_EXEMPTION_LAMPORTS,
} from "@coral-xyz/common";
import { useSolanaCtx } from "@coral-xyz/recoil";
import type { SolanaContext } from "@coral-xyz/secure-clients/legacyCommon";
import {
  SOL_NATIVE_MINT,
  SolanaProvider,
  WSOL_MINT,
} from "@coral-xyz/secure-clients/legacyCommon";
import type {
  QuoteGetRequest,
  QuoteResponse,
  SwapRequest,
  SwapResponse,
} from "@jup-ag/api";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import { BigNumber, ethers, FixedNumber } from "ethers";
import useAsyncEffect from "use-async-effect";

import type { CachedTokenBalance } from "./hooks";
import {
  GET_SWAP_OUTPUT_TOKENS,
  GET_SWAP_VALID_INPUT_TOKENS,
  useFromToken,
  useToToken,
} from "./hooks";

const { Zero } = ethers.constants;

const DEFAULT_SLIPPAGE_PERCENT = 1;
const JUPITER_BASE_URL = "https://jupiter.xnfts.dev/v6/";

//
// Quote response from different data sources.
//
export type SwapQuoteResponse = {
  kind: SwapQuoteResponseKind;
  data: SwapQuoteResponseData;
};
type SwapQuoteResponseKind = SwapQuoteResponseKindSolana;
type SwapQuoteResponseData = SwapQuoteResponseDataSolana;

type SwapQuoteResponseKindSolana = "jupiter";
type SwapQuoteResponseDataSolana = QuoteResponse;

export function useSwapValidInputTokens({
  from,
  to,
  fromBalances,
}: {
  from: {
    walletPublicKey: string;
    mint: string;
    blockchain: Blockchain;
  } | null;
  to: {
    walletPublicKey: string;
    mint: string;
    blockchain: Blockchain;
  } | null;
  fromBalances: CachedTokenBalance[];
}): [CachedTokenBalance[], boolean] {
  const swapValidInputTokensSolana =
    useSwapValidInputTokensSolanaFn(fromBalances);
  const [response, setResponse] = useState<[CachedTokenBalance[], boolean]>([
    [],
    true,
  ]);

  useAsyncEffect(
    async (isMounted) => {
      if (from === null) {
        return;
      }

      setResponse([[], true]);
      const data = await (async () => {
        const swapTy = swapType({ from, to });
        switch (swapTy) {
          case SwapType.Solana:
            return await swapValidInputTokensSolana();
          case SwapType.Wormhole:
            // todo
            throw new Error("swap not implemented for wormhole");
          default:
            throw new Error("swap not implemented for non solana blockchains");
        }
      })();
      if (!isMounted()) {
        return;
      }
      setResponse([data ?? [], false]);
    },
    [swapValidInputTokensSolana, from, to]
  );

  return response;
}

export function useSwapOutputTokens({
  from,
  to,
  outputBalances,
}: {
  from: {
    walletPublicKey: string;
    mint: string;
    blockchain: Blockchain;
  } | null;
  to: {
    walletPublicKey: string;
    mint: string;
    blockchain: Blockchain;
  } | null;
  outputBalances: CachedTokenBalance[];
}): [CachedTokenBalance[], boolean] {
  const swapOutputTokensSolana = useSwapOutputTokensSolanaFn(
    from?.mint ?? "",
    outputBalances
  );
  const [response, setResponse] = useState<[CachedTokenBalance[], boolean]>([
    [],
    true,
  ]);

  useAsyncEffect(
    async (isMounted) => {
      if (from === null) {
        return;
      }

      setResponse([[], true]);
      const data = await (async () => {
        const swapTy = swapType({ from, to });
        switch (swapTy) {
          case SwapType.Solana:
            return await swapOutputTokensSolana();
          case SwapType.Wormhole:
            // todo
            throw new Error("swap not implemented for wormhole");
          default:
            throw new Error("swap not implemented for non solana blockchains");
        }
      })();
      if (!isMounted()) {
        return;
      }
      setResponse([data ?? [], false]);
    },
    [swapOutputTokensSolana, from, to]
  );

  return response;
}

export function useFetchTransaction({
  from,
  to,
  quoteResponse,
}: {
  from: {
    walletPublicKey: string;
    mint: string;
    blockchain: Blockchain;
  };
  to: {
    walletPublicKey: string;
    mint: string;
    blockchain: Blockchain;
  } | null;
  quoteResponse: SwapQuoteResponse | null;
}): () => Promise<string> {
  return useCallback(async () => {
    if (quoteResponse === null) {
      throw new Error("quote not found");
    }
    const swapTy = swapType({ from, to });
    switch (swapTy) {
      case SwapType.Solana:
        return await fetchTransactionSolana({
          from,
          quoteResponse,
        });
      case SwapType.Wormhole:
        // todo
        throw new Error("swap not implemented for wormhole");
      default:
        throw new Error("swap not implemented for non solana blockchains");
    }
  }, [quoteResponse, from, to]);
}

export function useFetchQuote({
  from,
  to,
}: {
  from: {
    walletPublicKey: string;
    mint: string;
    blockchain: Blockchain;
  };
  to: {
    walletPublicKey: string;
    mint: string;
    blockchain: Blockchain;
  } | null;
}): (fromAmount: BigNumber) => Promise<SwapQuoteResponse | null> {
  return useCallback(
    async (fromAmount: BigNumber) => {
      const swapTy = swapType({ from, to });
      switch (swapTy) {
        case SwapType.Solana:
          return await fetchQuoteSolana({
            from,
            to,
            fromAmount,
          });
        case SwapType.Wormhole:
          // todo
          throw new Error("swap not implemented for wormhole");
        default:
          throw new Error("swap not implemented for non solana blockchains");
      }
    },
    [from, to]
  );
}

export function useSendTransaction({
  from,
  to,
  fromAmount,
  quoteResponse,
}: {
  from: {
    walletPublicKey: string;
    mint: string;
    blockchain: Blockchain;
  };
  to: {
    walletPublicKey: string;
    mint: string;
    blockchain: Blockchain;
  } | null;
  fromAmount: BigNumber | null;
  quoteResponse: SwapQuoteResponse | null;
}): (tx: string) => Promise<string> {
  const solanaCtx = useSolanaCtx();
  const { fromToken, isLoading: isLoadingFromToken } = useFromToken({
    from,
    to,
  });
  const { toToken, isLoading: isLoadingToToken } = useToToken({ from, to });

  return useCallback(
    async (transaction: string) => {
      if (
        !to ||
        !fromToken ||
        !toToken ||
        isLoadingFromToken ||
        isLoadingToToken ||
        !quoteResponse
      ) {
        throw new Error("tokens not loaded");
      }
      const swapTy = swapType({ from, to });
      switch (swapTy) {
        case SwapType.Solana:
          return await sendTransactionSolana({
            solanaCtx,
            to,
            fromAmount,
            fromToken,
            toToken,
            quoteResponse,
            serializedTransaction: transaction,
          });
        case SwapType.Wormhole:
          // todo
          throw new Error("swap not implemented for wormhole");
        default:
          throw new Error("swap not implemented for non solana blockchains");
      }
    },
    [
      from,
      to,
      fromToken,
      toToken,
      isLoadingFromToken,
      isLoadingToToken,
      quoteResponse,
      solanaCtx,
    ]
  );
}

export function useAvailableForSwap({
  from,
  to,
}: {
  from: {
    walletPublicKey: string;
    mint: string;
    blockchain: Blockchain;
  };
  to: {
    walletPublicKey: string;
    mint: string;
    blockchain: Blockchain;
  } | null;
}): {
  isLoading: boolean;
  availableForSwap: BigNumber | null;
} {
  const { isLoading, fromToken } = useFromToken({ from, to });

  if (isLoading) {
    return {
      isLoading,
      availableForSwap: null,
    };
  }

  const availableForSwap = (() => {
    const swapTy = swapType({ from, to });
    const a = fromToken ? BigNumber.from(fromToken.amount) : Zero;
    switch (swapTy) {
      case SwapType.Solana:
        return availableForSwapOffsetSolana({
          from,
          availableForSwap: a,
        });
      case SwapType.Wormhole:
        // todo
        throw new Error("swap not implemented for wormhole");
      default:
        throw new Error("swap not implemented for non solana blockchains");
    }
  })();

  return {
    isLoading: false,
    availableForSwap,
  };
}

////////////////////////////////////////////////////////////////////////////////
// Blockchain specific utils below (can move to another file once
// the shape of this is more clear--probably best todo once we do wormhole or
// Ethereum swaps).
////////////////////////////////////////////////////////////////////////////////

function useSwapValidInputTokensSolanaFn(
  balances: CachedTokenBalance[]
): () => Promise<CachedTokenBalance[]> {
  const apollo = useApolloClient();

  return useCallback(async () => {
    const { data } = await apollo.query({
      query: GET_SWAP_VALID_INPUT_TOKENS,
      fetchPolicy: "cache-first",
      variables: {
        tokens: balances.map((b) => b.token),
      },
    });
    const mints = (data?.jupiterSwapValidInputTokens ?? []) as string[];

    return balances.filter(
      (b) => mints.includes(b.token) || b.token === SOL_NATIVE_MINT
    );
  }, [apollo, balances]);
}

// TODO: remove this function as soon as mobile is migrated over to the
//       new swap patterns.
export function useSwapValidInputTokensSolana(
  balances: CachedTokenBalance[]
): [CachedTokenBalance[], boolean] {
  const { data, loading } = useQuery(GET_SWAP_VALID_INPUT_TOKENS, {
    fetchPolicy: "cache-and-network",
    variables: {
      tokens: balances.map((b) => b.token),
    },
  });

  const values = useMemo(() => {
    const mints = (
      loading ? [] : data?.jupiterSwapValidInputTokens ?? []
    ) as string[];

    return balances.filter(
      (b) => mints.includes(b.token) || b.token === SOL_NATIVE_MINT
    );
  }, [balances, data, loading]);

  return [values, loading];
}

function useSwapOutputTokensSolanaFn(
  inputToken: string,
  outputBalances: CachedTokenBalance[]
): () => Promise<CachedTokenBalance[]> {
  const apollo = useApolloClient();

  return useCallback(async () => {
    const { data } = await apollo.query({
      query: GET_SWAP_OUTPUT_TOKENS,
      fetchPolicy: "cache-first",
      variables: {
        inputToken: inputToken === SOL_NATIVE_MINT ? WSOL_MINT : inputToken,
      },
    });

    const nodes = (() =>
      data?.jupiterSwapOutputTokens?.map((t) => {
        const b = outputBalances.find(
          (b) =>
            b.token === (t.address === WSOL_MINT ? SOL_NATIVE_MINT : t.address)
        );

        return {
          id: b?.id ?? "",
          amount: b?.amount ?? "0",
          displayAmount: b?.displayAmount ?? "0",
          marketData: {
            value: b?.marketData?.value ?? 0,
            valueChange: b?.marketData?.valueChange ?? 0,
          },
          token: t.address,
          tokenListEntry: {
            ...t,
            name: t.address === WSOL_MINT ? "Solana" : t.name,
          },
        };
      }) ?? [])();

    return nodes;
  }, [apollo, inputToken, outputBalances]);
}

// TODO: remove this function as soon as mobile is migrated over to the
//       new swap patterns.
export function useSwapOutputTokensSolana(
  inputToken: string,
  outputBalances: CachedTokenBalance[]
): [CachedTokenBalance[], boolean] {
  const { data, loading } = useQuery(GET_SWAP_OUTPUT_TOKENS, {
    fetchPolicy: "cache-and-network",
    variables: {
      inputToken: inputToken === SOL_NATIVE_MINT ? WSOL_MINT : inputToken,
    },
  });

  const nodes = useMemo<CachedTokenBalance[]>(
    () =>
      loading
        ? []
        : data?.jupiterSwapOutputTokens?.map((t) => {
            const b = outputBalances.find(
              (b) =>
                b.token ===
                (t.address === WSOL_MINT ? SOL_NATIVE_MINT : t.address)
            );

            return {
              id: b?.id ?? "",
              amount: b?.amount ?? "0",
              displayAmount: b?.displayAmount ?? "0",
              marketData: {
                value: b?.marketData?.value ?? 0,
                valueChange: b?.marketData?.valueChange ?? 0,
              },
              token: t.address,
              tokenListEntry: {
                ...t,
                name: t.address === WSOL_MINT ? "Solana" : t.name,
              },
            };
          }) ?? [],
    [outputBalances, data, loading]
  );

  return [nodes, loading];
}

enum SwapType {
  Solana,
  Wormhole,
}

function swapType({
  from,
  to,
}: {
  from: {
    walletPublicKey: string;
    mint: string;
    blockchain: Blockchain;
  };
  to: {
    walletPublicKey: string;
    mint: string;
    blockchain: Blockchain;
  } | null;
}): SwapType {
  if (to !== null && from.blockchain !== to.blockchain) {
    return SwapType.Wormhole;
  }
  switch (from.blockchain) {
    case Blockchain.SOLANA:
      return SwapType.Solana;
    default:
      throw new Error("blockchain not available for swap!");
  }
}

////////////////////////////////////////////////////////////////////////////////
// Solana.
////////////////////////////////////////////////////////////////////////////////

//
// Load the transactions required to execute the swap.
//
async function fetchTransactionSolana({
  from,
  quoteResponse,
}: {
  from: { walletPublicKey: string; mint: string; blockchain: Blockchain };
  quoteResponse: SwapQuoteResponse;
}): Promise<string> {
  // Jupiter swap. Although Jupiter can return between 1 and 3 transactions
  // to perform a swap, we should only ever get one as we are using the
  // onlyDirectRoutes parameter.
  const response = await fetch(`${JUPITER_BASE_URL}swap`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      quoteResponse: quoteResponse.data,
      wrapAndUnwrapSol: true,
      userPublicKey: from.walletPublicKey,
      // asLegacyTransaction: false,
    } as SwapRequest),
  });
  const swapResult = (await response.json()) as SwapResponse;
  return swapResult.swapTransaction;
}

async function fetchQuoteSolana({
  from,
  to,
  fromAmount,
}: {
  from: {
    walletPublicKey: string;
    mint: string;
    blockchain: Blockchain;
  };
  to: {
    walletPublicKey: string;
    mint: string;
    blockchain: Blockchain;
  } | null;
  fromAmount: BigNumber;
}): Promise<SwapQuoteResponse | null> {
  const params = {
    // If the swap is to or from native SOL we want Jupiter to return wSOL
    // routes because it does not support native SOL routes.
    inputMint: from.mint === SOL_NATIVE_MINT ? WSOL_MINT : from.mint,
    outputMint: to?.mint === SOL_NATIVE_MINT ? WSOL_MINT : to?.mint,
    amount: fromAmount.toString() as unknown as number,
    slippageBps: (
      DEFAULT_SLIPPAGE_PERCENT * 100
    ).toString() as unknown as number,
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
      // manually if status code is outside of 200-29969 range
      throw new Error(response.status.toString());
    }
    const data = (await response.json()) as QuoteResponse;
    return { kind: "jupiter", data };
  } catch (e) {
    console.error("error fetching swap routes", e);
    return null;
  }
}

//
// Estimate the network fees the transactions will incur.
//
async function estimateFeesSolana({
  solanaCtx,
  to,
  quoteResponse,
  transaction,
}: {
  solanaCtx: SolanaContext;
  to: { walletPublicKey: string; mint: string; blockchain: Blockchain };
  quoteResponse: SwapQuoteResponse;
  transaction: string;
}) {
  const { connection } = solanaCtx;
  const [solanaNetworkFee, tokenAccountCreationFee] = await Promise.all([
    (async () => {
      if (!quoteResponse || transaction === undefined) {
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
      if (to === null) {
        throw new Error("to is null");
      }
      try {
        if ([SOL_NATIVE_MINT, WSOL_MINT].includes(to?.mint)) {
          return 0;
        }
        // if the output mint token account contains no lamports then we must create it
        else if (
          !(await connection.getBalance(
            await getAssociatedTokenAddress(
              new PublicKey(to?.mint),
              new PublicKey(to.walletPublicKey)
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
}

async function sendTransactionSolana({
  solanaCtx,
  to,
  fromAmount,
  fromToken,
  toToken,
  quoteResponse,
  serializedTransaction,
}: {
  solanaCtx: SolanaContext;
  to: { walletPublicKey: string; mint: string; blockchain: Blockchain };
  fromAmount: BigNumber | null;
  fromToken: CachedTokenBalance;
  toToken: CachedTokenBalance;
  quoteResponse: SwapQuoteResponse;
  serializedTransaction: string;
}): Promise<string> {
  const priceImpactPct = Number(quoteResponse.data.priceImpactPct);

  const decimalDifference =
    fromToken!.tokenListEntry!.decimals - toToken!.tokenListEntry!.decimals;

  // Scale a FixedNumber up or down by a number of decimals
  const scale = (x: FixedNumber, decimalDifference: number) => {
    if (decimalDifference > 0) {
      return x.mulUnsafe(FixedNumber.from(10 ** decimalDifference));
    } else if (decimalDifference < 0) {
      return x.divUnsafe(FixedNumber.from(10 ** Math.abs(decimalDifference)));
    }
    return x;
  };

  const rate = fromAmount?.gt(Zero)
    ? ethers.utils.commify(
        scale(
          FixedNumber.from(quoteResponse.data.outAmount).divUnsafe(
            FixedNumber.from(fromAmount)
          ),
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

  const swapFee = quoteResponse?.data.platformFee;
  const transactionFees = await estimateFeesSolana({
    solanaCtx,
    to,
    transaction: serializedTransaction,
    quoteResponse,
  });

  const signature = await SolanaProvider.signAndSendTransaction(
    solanaCtx,
    legacyOrVersionedTransaction,
    {
      type: "SWAP_TOKENS",
      toToken: toToken!.token,
      toAmount: quoteResponse.data.outAmount.toString(),
      fromToken: fromToken!.token,
      fromAmount: fromAmount!.toString(),
      backpackFeePercent: swapFee?.feeBps ? swapFee.feeBps / 100 : 0,
      transactionFees: transactionFees!,
      priceImpact,
      rate,
      expirationTimeMs: 20_000,
    }
  );

  return signature;
}

function availableForSwapOffsetSolana({
  from,
  availableForSwap,
}: {
  from: {
    walletPublicKey: string;
    mint: string;
    blockchain: Blockchain;
  };
  availableForSwap: BigNumber;
}) {
  // If from mint is native SOL, remove the transaction fee and rent exemption
  // from from the max swap amount
  if (from.mint === SOL_NATIVE_MINT) {
    availableForSwap = availableForSwap
      .sub(BigNumber.from(TOKEN_ACCOUNT_RENT_EXEMPTION_LAMPORTS)) // Hard code
      // this number for convenience. This isn't actually correct. But Dynamically
      // calculating this is painful.
      .sub(BigNumber.from(NATIVE_ACCOUNT_RENT_EXEMPTION_LAMPORTS));
    if (availableForSwap.lt(Zero)) {
      availableForSwap = Zero;
    }
  }
  return availableForSwap;
}
