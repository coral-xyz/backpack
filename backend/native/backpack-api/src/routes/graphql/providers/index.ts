import type { ApiContext } from "../context";
import {
  type BalanceFiltersInput,
  type Balances,
  type NftConnection,
  type NftFiltersInput,
  ProviderId,
  type TransactionConnection,
  type TransactionFiltersInput,
} from "../types";

import { Bitcoin } from "./bitcoin";
import { Ethereum } from "./ethereum";
import { Solana } from "./solana";

export interface BlockchainDataProvider {
  id(): ProviderId;
  decimals(): number;
  defaultAddress(): string;
  logo(): string;
  name(): string;
  symbol(): string;

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
}

/**
 * Factory function for returning an instance of `BlockchainDataProvider`
 * based on the enum variant argued.
 * @export
 * @param {ProviderId} id
 * @param {ApiContext} [ctx]
 * @returns {BlockchainDataProvider}
 */
export function getProviderForId(
  id: ProviderId,
  ctx?: ApiContext
): BlockchainDataProvider {
  switch (id) {
    case ProviderId.Bitcoin: {
      return new Bitcoin(ctx);
    }
    case ProviderId.Ethereum: {
      return new Ethereum(ctx);
    }
    case ProviderId.Solana: {
      return new Solana(ctx);
    }
  }
}
