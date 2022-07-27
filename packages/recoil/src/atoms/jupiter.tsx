import { atom, selector, selectorFamily } from "recoil";
import { Transaction } from "@solana/web3.js";
import { TokenInfo } from "@solana/spl-token-registry";
import { Blockchain } from "@coral-xyz/common";
import * as atoms from ".";

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

export const jupiterRouteMap = selector({
  key: "jupiterRouteMap",
  get: async ({}) => {
    const response = await (
      await fetch(`${JUPITER_BASE_URL}indexed-route-map`)
    ).json();
    const getMint = (index: number) => response["mintKeys"][index];
    // Replace indices with mint addresses
    return Object.keys(response["indexedRouteMap"]).reduce((acc, key) => {
      acc[getMint(parseInt(key))] = response["indexedRouteMap"][key].map(
        (i: number) => getMint(i)
      );
      return acc;
    }, {});
  },
});

// All input tokens for Jupiter
export const jupiterInputMints = selector({
  key: "jupiterInputMints",
  get: async ({ get }) => {
    const routeMap = get(jupiterRouteMap);
    return Object.keys(routeMap);
  },
});

// Jupiter tokens that can be swapped *from* owned by the currently active
// wallet.
export const walletJupiterTokens = selector({
  key: "walletJupiterTokens",
  get: async ({ get }) => {
    const inputMints = get(jupiterInputMints);
    const walletTokens = get(atoms.blockchainTokensSorted(Blockchain.SOLANA));
    // Only allow tokens that Jupiter allows.
    return walletTokens.filter((t: any) => inputMints.includes(t.mint));
  },
});

export const swapTokenList = selectorFamily({
  key: "swapTokenList",
  get:
    ({ mint, isFrom }: { mint: string; isFrom: boolean }) =>
    ({ get }: any) => {
      if (isFrom) {
        return get(walletJupiterTokens);
      } else {
        const routeMap = get(jupiterRouteMap);
        return routeMap[mint].map((mint: string) => {
          const tokenRegistry = get(atoms.splTokenRegistry)!;
          const tokenMetadata = tokenRegistry.get(mint) ?? ({} as TokenInfo);
          const { name, symbol, logoURI } = tokenMetadata;
          return { name, symbol, logoURI };
        });
      }
    },
});

/**
export const jupiterRoutes = selectorFamily({
  key: "jupiterRoutes",
  get:
    ({
      inputMint,
      outputMint,
      amount,
      slippage,
      feeBps,
    }: {
      inputMint: string;
      outputMint: string;
      amount: string;
      slippage: string;
      feeBps: string;
    }) =>
    async (): Promise<JupiterRoute[]> => {
      const params = {
        inputMint,
        outputMint,
        amount,
        slippage,
        feeBps,
      };
      const queryString = new URLSearchParams(params).toString();
      // TODO: simulate this query failing
      const { data } = await (
        await fetch(`${JUPITER_BASE_URL}quote?${queryString}`)
      ).json();
      return data;
    },
});

export const jupiterTransactions = selector({
  key: "jupiterTransactions",
  get: async ({ get }) => {
    const routes = get(jupiterRoutes);
    if (routes.length > 0) {
      const body = {
        route: routes[0],
        userPublicKey: get(atoms.activeWallet),
      };
      return await (
        await fetch(`${JUPITER_BASE_URL}swap`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        })
      ).json();
    } else {
      return [];
    }
  },
});

export const jupiterTransactionFee = selector({
  key: "jupiterTransactionFee",
  get: async ({ get }) => {
    const { connection } = get(atoms.anchorContext);
    const transactions = get(jupiterTransactions);
    let fee = 0;
    for (const serializedTransaction of Object.values(transactions)) {
      const transaction = Transaction.from(
        Buffer.from(serializedTransaction, "base64")
      );
      // Under the hood this just calls connection.getFeeForMessage with
      // the message, it's a convenience method
      try {
        fee += await transaction.getEstimatedFee(connection);
      } catch {
        // TODO errors here for connection unavailable intermittently, why?
        // TODO should we provide no estimate instead? 5000 lamports seems ballpark
        fee += 5000;
      }
    }
    return fee;
  },
});
**/
