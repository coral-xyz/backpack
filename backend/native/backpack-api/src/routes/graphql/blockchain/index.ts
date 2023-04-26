import type { ApiContext } from "../context";
import {
  ChainId,
  type Nft,
  type Transaction,
  type WalletBalances,
} from "../types";

import { Ethereum } from "./ethereum";
import { Solana } from "./solana";

export interface Blockchain {
  getBalancesForAddress(address: string): Promise<WalletBalances | null>;
  getNftsForAddress(address: string): Promise<Nft[] | null>;
  getTransactionsForAddress(
    address: string,
    before?: string,
    after?: string
  ): Promise<Transaction[] | null>;
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
 * Calculate the decimaled value for an account's token balance.
 * @export
 * @param {number} amt
 * @param {number} decimals
 * @returns {number}
 */
export function toBalance(amt: number, decimals: number): number {
  return amt / 10 ** decimals;
}
