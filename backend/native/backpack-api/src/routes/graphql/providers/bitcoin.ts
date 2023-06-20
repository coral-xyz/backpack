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

import type { BlockchainDataProvider } from ".";

/**
 * Bitcoin blockchain implementation for the common API.
 * @export
 * @class Bitcoin
 * @implements {BlockchainDataProvider}
 */
export class Bitcoin implements BlockchainDataProvider {
  readonly #ctx?: ApiContext;

  constructor(ctx?: ApiContext) {
    this.#ctx = ctx;
  }

  id(): ProviderId {
    return ProviderId.Bitcoin;
  }

  decimals(): number {
    return 8;
  }

  defaultAddress(): string {
    return ""; // FIXME:
  }

  logo(): string {
    return "https://assets.coingecko.com/coins/images/1/large/bitcoin.png";
  }

  name(): string {
    return "Bitcoin";
  }

  symbol(): string {
    return "BTC";
  }

  getBalancesForAddress(
    address: string,
    filters?: BalanceFiltersInput | undefined
  ): Promise<Balances> {
    throw new Error("Method not implemented.");
  }

  getNftsForAddress(
    address: string,
    filters?: NftFiltersInput | undefined
  ): Promise<NftConnection> {
    throw new Error("Method not implemented.");
  }

  getTransactionsForAddress(
    address: string,
    filters?: TransactionFiltersInput | undefined
  ): Promise<TransactionConnection> {
    throw new Error("Method not implemented.");
  }
}
