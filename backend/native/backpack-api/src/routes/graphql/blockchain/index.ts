import type { ApiContext } from "../context";
import {
  type Balances,
  ChainId,
  type NftConnection,
  type TransactionConnection,
} from "../types";

import { Ethereum } from "./ethereum";
import { Solana } from "./solana";

export interface Blockchain {
  getBalancesForAddress(address: string): Promise<Balances | null>;
  getNftsForAddress(address: string): Promise<NftConnection | null>;
  getTransactionsForAddress(
    address: string,
    before?: string,
    after?: string
  ): Promise<TransactionConnection | null>;
  id(): ChainId;
  nativeDecimals(): number;
}

/**
 * Factory function for returning an instance of `Blockchain` based
 * on the enum variant argued.
 * @export
 * @param {ChainId} id
 * @returns {Blockchain}
 */
export function getBlockchainForId(id: ChainId, ctx: ApiContext): Blockchain {
  switch (id) {
    case ChainId.Ethereum: {
      return new Ethereum(ctx);
    }
    case ChainId.Solana: {
      return new Solana(ctx);
    }
  }
}

/**
 * Calculates percent change from coingecko data
 * @export
 * @param {number} change
 * @param {number} price
 * @returns {number}
 */
export function calculatePercentChange(change: number, price: number): number {
  const percentChange = (change / price) * 100;
  return Number(percentChange.toFixed(2));
}
