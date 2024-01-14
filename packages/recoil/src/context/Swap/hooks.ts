import { useMemo, useRef, useState } from "react";
import { useFragment, useQuery } from "@apollo/client";
import { Blockchain } from "@coral-xyz/common";
import { SOL_NATIVE_MINT } from "@coral-xyz/secure-clients/legacyCommon";
import type { BigNumber } from "ethers";
import { ethers } from "ethers";
import { useAsyncEffect } from "use-async-effect";

import { gql } from "../../apollo";
import type {
  GetCachedTokenBalancesQuery,
  ProviderId,
} from "../../apollo/graphql";

import type { SwapQuoteResponse } from "./blockchain-hooks";
import {
  useFetchQuote,
  useFetchTransaction,
  useSendTransaction,
  useSwapOutputTokens,
  useSwapValidInputTokens,
} from "./blockchain-hooks";

export * from "./blockchain-hooks";

const { Zero } = ethers.constants;
const ROUTE_POLL_INTERVAL = 10000;

const TokenMintForAssetIdFragment = gql(`
  fragment TokenMintForAssetIdFragment on TokenBalance {
    id
    token
  }
`);

export const GET_SWAP_VALID_INPUT_TOKENS = gql(`
    query GetSwapValidInputTokens($tokens: [String!]!) {
      jupiterSwapValidInputTokens(tokens: $tokens)
    }
`);

const GET_TOKEN_BALANCES = gql(`
  query GetCachedTokenBalances($providerId: ProviderID!, $address: String!) {
    wallet(providerId: $providerId, address: $address) {
      balances {
        tokens {
          edges {
            node {
              id
              amount
              displayAmount
              token
              marketData {
                value
                valueChange
              }
              tokenListEntry {
                id
                address
                decimals
                logo
                name
                symbol
              }
            }
          }
        }
      }
    }
  }
`);

export const GET_SWAP_OUTPUT_TOKENS = gql(`
  query GetSwapOutputTokens($inputToken: String!) {
    jupiterSwapOutputTokens(inputToken: $inputToken) {
      id
      address
      decimals
      logo
      name
      symbol
    }
  }
`);

// TODO: need to test if this works for asset ids for other chains.
export function useMintForAssetId(id?: string): string | null {
  const { data } = useFragment({
    fragment: TokenMintForAssetIdFragment,
    from: {
      __typename: "TokenBalance",
      id,
    },
  });

  if (!id) {
    return SOL_NATIVE_MINT;
  }

  return data?.token ?? null;
}

export type CachedTokenBalance = NonNullable<
  NonNullable<GetCachedTokenBalancesQuery["wallet"]>["balances"]
>["tokens"]["edges"][number]["node"];

export function useTokenBalances({
  walletPublicKey,
  blockchain,
}: {
  walletPublicKey: string;
  blockchain: Blockchain;
}): {
  balances: CachedTokenBalance[];
  isLoading: boolean;
} {
  const { data, loading } = useQuery(GET_TOKEN_BALANCES, {
    fetchPolicy: "cache-only",
    returnPartialData: true,
    variables: {
      address: walletPublicKey,
      providerId: blockchain.toUpperCase() as ProviderId,
    },
  });

  const nodes = useMemo(
    () =>
      loading
        ? []
        : data?.wallet?.balances?.tokens.edges.map((e) => e.node) ?? [],
    [data, loading]
  );

  return { balances: nodes, isLoading: loading };
}

export function useQuote({
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
  fromAmount: BigNumber | null;
}): {
  quoteResponse: SwapQuoteResponse | null;
  isLoading: boolean;
  isError: boolean;
} {
  const shortCircuit = to === null || fromAmount === null;

  const fetchQuote = useFetchQuote({
    from,
    to,
  });
  const [quoteResponse, setQuoteResponse] = useState<SwapQuoteResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const pollIdRef: { current: NodeJS.Timeout | number | null } = useRef(null);
  const stopRoutePolling = () => {
    if (pollIdRef.current) {
      clearInterval(pollIdRef.current);
    }
  };

  //
  // WARNING: it's important to useAsyncEffect here to properly manage
  //          state of the poller on rerenders. This is very easy to mess up.
  //          If you touch this code make sure you know what you're doing
  //          or quotes will be broken.
  //
  useAsyncEffect(
    async (isMounted) => {
      if (shortCircuit) {
        return;
      }
      const loadRoutes = async () => {
        if (fromAmount && fromAmount.gt(Zero) && from.mint !== to?.mint) {
          const data = await fetchQuote(fromAmount);
          if (!isMounted()) {
            return;
          }
          if (data === null) {
            setIsError(true);
          } else {
            setIsError(false);
          }
          setQuoteResponse(data);
          stopRoutePolling();
          const pollId = setTimeout(loadRoutes, ROUTE_POLL_INTERVAL);
          pollIdRef.current = pollId;
        } else {
          setQuoteResponse(null);
        }
        setIsLoading(false);
      };
      setQuoteResponse(null);
      setIsLoading(true);

      await loadRoutes().catch((e) => {
        console.error(e);
      });
    },
    async () => {
      return stopRoutePolling();
    },
    [from?.mint, to?.mint, fromAmount, shortCircuit]
  );

  return {
    quoteResponse: fromAmount === null || isLoading ? null : quoteResponse,
    isLoading,
    isError,
  };
}

export function useExecuteSwap({
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
}): {
  executeSwap: (tx?: string) => Promise<string>;
} {
  const fetchTransaction = useFetchTransaction({
    from,
    to,
    quoteResponse,
  });
  const sendTransaction = useSendTransaction({
    from,
    to,
    fromAmount,
    quoteResponse,
  });

  //
  // Execute the transactions to perform the swap.
  //
  const executeSwap = async (tx?: string) => {
    if (!quoteResponse) {
      throw new Error("quote response not found");
    }
    if (to === null) {
      throw new Error("to token not found");
    }

    const transaction = tx ?? (await fetchTransaction());
    const signature = await sendTransaction(transaction);
    return signature;
  };

  return {
    executeSwap,
  };
}

/**
 * Returns the token object for the "out" token in a swap.
 */
export function useToToken({
  from,
  to,
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
}): {
  toToken: CachedTokenBalance | null;
  isLoading: boolean;
} {
  const { balances: outputBalances, isLoading: isLoadingTokenBalances } =
    useTokenBalances(
      to ?? {
        walletPublicKey: "",
        blockchain: Blockchain.SOLANA,
      }
    );
  const [toTokens, isLoadingToTokens] = useSwapOutputTokens({
    from,
    to,
    outputBalances,
  });

  // Need to convert SOL here because the wallet uses a different
  // internal representation of native sol vs the gql api server.
  const toMint =
    to?.mint === SOL_NATIVE_MINT
      ? "So11111111111111111111111111111111111111112"
      : to?.mint;
  const toToken =
    toTokens.find((t) => {
      if (toMint === "So11111111111111111111111111111111111111112") {
        if (t.token === SOL_NATIVE_MINT) {
          return true;
        }
      }
      return t.tokenListEntry?.address === toMint;
    }) ?? null;

  if (to === null) {
    return {
      toToken: null,
      isLoading: false,
    };
  }

  return {
    toToken: toToken ?? null,
    isLoading: isLoadingToTokens || isLoadingTokenBalances,
  };
}

/**
 * Returns the token object for the "in" token in a swap.
 */
export function useFromToken({
  from,
  to,
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
}): {
  fromToken: CachedTokenBalance | null;
  isLoading: boolean;
} {
  const { balances: fromBalances, isLoading: isLoadingTokenBalances } =
    useTokenBalances(
      from ?? {
        walletPublicKey: "",
        blockchain: Blockchain.SOLANA,
      }
    );
  const [fromTokens, isLoadingFromTokens] = useSwapValidInputTokens({
    fromBalances,
    from,
    to,
  });

  if (from === null) {
    return {
      fromToken: null,
      isLoading: false,
    };
  }

  // Need to convert SOL here because the wallet uses a different
  // internal representation of native sol vs the gql api server.
  const fromMint =
    from?.mint === SOL_NATIVE_MINT
      ? "So11111111111111111111111111111111111111112"
      : from?.mint;
  const fromToken =
    fromTokens.find((t) => {
      if (fromMint === "So11111111111111111111111111111111111111112") {
        if (t.token === SOL_NATIVE_MINT) {
          return true;
        }
      }
      return t.token === fromMint;
    }) ?? null;

  return {
    fromToken,
    isLoading: isLoadingFromTokens || isLoadingTokenBalances,
  };
}
