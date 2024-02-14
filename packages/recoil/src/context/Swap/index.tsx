import type { Blockchain } from "@coral-xyz/common";
import { BigNumber, ethers, FixedNumber } from "ethers";
import { createContext, useCallback, useContext, useState } from "react";
import useAsyncEffect from "use-async-effect";

import {
  type CachedTokenBalance,
  type SwapQuoteResponse,
  useFetchTransaction,
  useMintForAssetId,
  useQuote,
} from "./hooks";
import { useActiveWallet } from "../../hooks";

const { Zero } = ethers.constants;

export * from "./hooks";

export enum SwapState {
  INITIAL,
  CONFIRMATION,
  CONFIRMING,
  CONFIRMED,
  ERROR,
}

export type SwapContext = {
  from: BlockchainToken;
  setFrom: (f: BlockchainToken) => void;

  to: BlockchainToken | null;
  setTo: (t: BlockchainToken) => void;

  fromAmount: BigNumber | null;
  setFromAmount: (a: BigNumber | null) => void;

  swapToFrom: (currentOutAmount: BigNumber | null) => void;
};

type BlockchainToken = {
  walletPublicKey: string;
  mint: string;
  blockchain: Blockchain;
};

export function SwapProvider({
  defaultFromAssetId,
  children,
}: {
  defaultFromAssetId?: string;
  children: any;
}) {
  const { publicKey, blockchain } = useActiveWallet();
  const walletPublicKey = publicKey.toString();
  const defaultFromTokenMint = useMintForAssetId(defaultFromAssetId);

  if (defaultFromTokenMint === null) {
    throw new Error("invariant violation");
  }

  const [from, _setFrom] = useState<BlockchainToken>({
    walletPublicKey,
    mint: defaultFromTokenMint,
    blockchain,
  });
  const [to, setTo] = useState<BlockchainToken | null>(null);
  const [fromAmount, setFromAmount] = useState<BigNumber | null>(null);

  //
  // Changing the from token modifies the set of available output tokens, so reset
  // it and force the user to choose the output token again.
  //
  const setFrom = useCallback(
    (f: BlockchainToken) => {
      setTo(null);
      _setFrom(f);
    },
    [setTo, _setFrom]
  );

  const swapToFrom = useCallback(
    (currentToAmount: BigNumber | null) => {
      if (to === null) {
        return;
      }
      const oldTo = to;
      const oldFrom = from;

      setTo(oldFrom);
      _setFrom(oldTo);
      setFromAmount(currentToAmount);
    },
    [to, from, _setFrom, setTo, setFromAmount]
  );

  return (
    <_SwapContext.Provider
      value={{
        from,
        to,
        setFrom,
        setTo,
        fromAmount,
        setFromAmount,
        swapToFrom,
      }}
    >
      {children}
    </_SwapContext.Provider>
  );
}

const _SwapContext = createContext<SwapContext | null>(null);

export function useSwapContext(): SwapContext {
  const ctx = useContext(_SwapContext);
  if (ctx === null) {
    throw new Error("useSwapContext must be used within a SwapProvider");
  }
  return ctx;
}

export function QuoteProvider({ children }: { children: any }) {
  const { fromAmount, from, to } = useSwapContext();
  const { quoteResponse, isLoading, isError } = useQuote({
    from,
    to,
    fromAmount,
  });
  const fetchTransaction = useFetchTransaction({
    from,
    to,
    quoteResponse,
  });
  const [transaction, setTransaction] = useState<string | null>(null);

  //
  // Pre-fetch the transaction to make the secure ui popup faster.
  //
  useAsyncEffect(
    async (isMounted) => {
      if (!quoteResponse || isLoading || isError) {
        setTransaction(null);
        return;
      }
      const tx = await fetchTransaction();
      if (!isMounted()) {
        return;
      }
      setTransaction(tx);
    },
    [quoteResponse]
  );

  return (
    <_QuoteContext.Provider
      value={{
        quoteResponse,
        quoteResponseFormatter: quoteResponse
          ? new SwapQuoteResponseFormatter(quoteResponse)
          : null,
        transaction,
        isLoading,
        isError,
      }}
    >
      {children}
    </_QuoteContext.Provider>
  );
}

const _QuoteContext = createContext<QuoteContext | null>(null);

type QuoteContext = {
  quoteResponse: SwapQuoteResponse | null;
  quoteResponseFormatter: SwapQuoteResponseFormatter | null;
  transaction: string | null;
  isLoading: boolean;
  isError: boolean;
};

export function useQuoteContext(): QuoteContext {
  const ctx = useContext(_QuoteContext);
  if (ctx === null) {
    throw new Error("quote context not found");
  }
  return ctx;
}

// This class is used to create a blockchain agnostic formatter
// for the swap data used by the components.
//
// Internally it uses the `SwapQuoteResponse` type to dispatch
// to the correct handle for the appropriate "Kind" of response.
//
// Currently it only handles jupiter responses, but this can easily change
// to handle any other kinds that get added, which may have different
// shapes of internal data.
//
// TODO: when we have new "kind"s in the SwapQuoteResponse, we need
//       to dispatch based on the kind.
//
export class SwapQuoteResponseFormatter {
  public constructor(private quoteResponse: SwapQuoteResponse) {}

  public outAmount(toToken: CachedTokenBalance): string | null {
    // Solana.
    const toAmount = BigNumber.from(this.quoteResponse.data.outAmount);
    return toAmount && toToken
      ? ethers.utils.formatUnits(toAmount, toToken.tokenListEntry?.decimals)
      : null;
  }

  public outAmountBigNumber(): BigNumber | null {
    return BigNumber.from(this.quoteResponse.data.outAmount);
  }

  public priceImpact(): string {
    if (!this.quoteResponse.data.priceImpactPct) {
      return "0";
    }
    const priceImpact = Number(this.quoteResponse.data.priceImpactPct);
    return priceImpact > 0.1 ? priceImpact.toFixed(2) : "< 0.1";
  }

  public swapFee(): { feeBps?: number; amount?: string } | undefined {
    return this.quoteResponse.data.platformFee;
  }

  public networkFee(): string {
    return "~0.000005 SOL"; // TODO: we should account for ATA account creation here as well.
  }

  public exchangeRate({
    fromAmount,
    toAmount,
    fromToken,
    toToken,
  }: {
    fromAmount: BigNumber;
    toAmount: BigNumber;
    fromToken: CachedTokenBalance;
    toToken: CachedTokenBalance;
  }): string {
    const decimalDifference =
      fromToken.tokenListEntry!.decimals - toToken.tokenListEntry!.decimals;

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
            FixedNumber.from(toAmount).divUnsafe(FixedNumber.from(fromAmount)),
            decimalDifference
          ).toString()
        )
      : "0";

    return rate;
  }
}
