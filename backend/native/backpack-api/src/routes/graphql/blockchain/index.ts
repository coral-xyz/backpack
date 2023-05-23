import type { ApiContext } from "../context";
import {
  type BalanceFiltersInput,
  type Balances,
  ChainId,
  type NftConnection,
  type NftFiltersInput,
  type TransactionConnection,
  type TransactionFiltersInput,
} from "../types";

import { Ethereum } from "./ethereum";
import { Solana } from "./solana";

export interface Blockchain {
  getBalancesForAddress(
    address: string,
    filters?: BalanceFiltersInput
  ): Promise<Balances>;
  getNftsForAddress(
    address: string,
    filters?: NftFiltersInput
  ): Promise<NftConnection>;
  getTransactionsForAddress(
    address: string,
    filters?: TransactionFiltersInput
  ): Promise<TransactionConnection>;
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
