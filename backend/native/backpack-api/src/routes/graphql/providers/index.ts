import type { ApiContext } from "../context";
import type {
  BalanceFiltersInput,
  Balances,
  NftConnection,
  NftFiltersInput,
  TransactionConnection,
  TransactionFiltersInput,
} from "../types";
import { ProviderId } from "../types";

import { Bitcoin } from "./bitcoin";
import { Eclipse } from "./eclipse";
import { Ethereum } from "./ethereum";
import { Polygon } from "./polygon";
import { Solana } from "./solana";

export interface BlockchainDataProvider {
  id(): ProviderId;
  decimals(): number;
  defaultAddress(): string;
  logo(): string;
  name(): string;

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
 * @param {ApiContext} [context]
 * @returns {BlockchainDataProvider}
 */
export function getProviderForId(
  id: ProviderId,
  context?: ApiContext
): BlockchainDataProvider {
  switch (id) {
    case ProviderId.Bitcoin: {
      return new Bitcoin({ context });
    }
    case ProviderId.Eclipse: {
      return new Eclipse({ context });
    }
    case ProviderId.Ethereum: {
      return new Ethereum({ context });
    }
    case ProviderId.Polygon: {
      return new Polygon({ context });
    }
    case ProviderId.Solana: {
      return new Solana({ context });
    }
  }
}

/**
 * Infer and return a ProviderId enum variant from the argued string value.
 * @export
 * @param {string} val
 * @returns {(ProviderId | never)}
 */
export function inferProviderIdFromString(val: string): ProviderId | never {
  switch (val.toLowerCase()) {
    case "bitcoin": {
      return ProviderId.Bitcoin;
    }
    case "eclipse": {
      return ProviderId.Eclipse;
    }
    case "ethereum": {
      return ProviderId.Ethereum;
    }
    case "polygon": {
      return ProviderId.Polygon;
    }
    case "solana": {
      return ProviderId.Solana;
    }
    default: {
      throw new Error(`unknown chain id string: ${val}`);
    }
  }
}
