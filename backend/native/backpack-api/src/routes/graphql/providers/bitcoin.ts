import { BitcoinToken } from "@coral-xyz/common";
import { ethers } from "ethers";

import type { ApiContext } from "../context";
import { NodeBuilder } from "../nodes";
import {
  type BalanceFiltersInput,
  type Balances,
  type NftConnection,
  type NftFiltersInput,
  ProviderId,
  type TokenBalance,
  type Transaction,
  type TransactionConnection,
  type TransactionFiltersInput,
} from "../types";
import { calculateBalanceAggregate, createConnection } from "../utils";

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

  /**
   * Chain ID enum variant.
   * @returns {ProviderId}
   * @memberof Bitcoin
   */
  id(): ProviderId {
    return ProviderId.Bitcoin;
  }

  /**
   * Native coin decimals.
   * @returns {number}
   * @memberof Bitcoin
   */
  decimals(): number {
    return 8;
  }

  /**
   * Default native address.
   * @returns {string}
   * @memberof Bitcoin
   */
  defaultAddress(): string {
    return BitcoinToken.address;
  }

  /**
   * Logo of the native coin.
   * @returns {string}
   * @memberof Bitcoin
   */
  logo(): string {
    return BitcoinToken.logo!;
  }

  /**
   * The display name of the data provider.
   * @returns {string}
   * @memberof Bitcoin
   */
  name(): string {
    return BitcoinToken.name;
  }

  /**
   * Symbol of the native coin.
   * @returns {string}
   * @memberof Bitcoin
   */
  symbol(): string {
    return BitcoinToken.symbol;
  }

  /**
   * Fetch and aggregate the native and prices for the argued wallet address.
   * @param {string} address
   * @param {BalanceFiltersInput} [_filters]
   * @returns {Promise<Balances>}
   * @memberof Bitcoin
   */
  async getBalancesForAddress(
    address: string,
    _filters?: BalanceFiltersInput
  ): Promise<Balances> {
    if (!this.#ctx) {
      throw new Error("API context object not available");
    }

    const balance = await this.#ctx.dataSources.blockchainInfo.getBalance(
      address
    );

    const prices = await this.#ctx.dataSources.coinGecko.getPrices(["bitcoin"]);
    const displayAmount = ethers.utils.formatUnits(
      balance.final_balance,
      this.decimals()
    );

    const nodes: TokenBalance[] = [
      NodeBuilder.tokenBalance(
        this.id(),
        {
          address,
          amount: balance.final_balance.toString(),
          decimals: this.decimals(),
          displayAmount,
          marketData: prices?.bitcoin
            ? NodeBuilder.marketData("bitcoin", {
                lastUpdatedAt: prices.bitcoin.last_updated,
                percentChange: prices.bitcoin.price_change_percentage_24h,
                price: prices.bitcoin.current_price,
                sparkline: prices.bitcoin.sparkline_in_7d.price,
                usdChange: prices.bitcoin.price_change_24h,
                value: parseFloat(displayAmount) * prices.bitcoin.current_price,
                valueChange:
                  parseFloat(displayAmount) * prices.bitcoin.price_change_24h,
              })
            : undefined,
          token: this.defaultAddress(),
          tokenListEntry: NodeBuilder.tokenListEntry({
            address: this.defaultAddress(),
            coingeckoId: "bitcoin",
            logo: this.logo(),
            name: this.name(),
            symbol: this.symbol(),
          }),
        },
        true
      ),
    ];

    return NodeBuilder.balances(address, this.id(), {
      aggregate: calculateBalanceAggregate(address, nodes),
      tokens: createConnection(nodes, false, false),
    });
  }

  /**
   * Get a list of NFT data for tokens owned by the argued address.
   * @param {string} _address
   * @param {NftFiltersInput} [_filters]
   * @returns {Promise<NftConnection>}
   * @memberof Bitcoin
   */
  async getNftsForAddress(
    _address: string,
    _filters?: NftFiltersInput | undefined
  ): Promise<NftConnection> {
    return createConnection([], false, false);
  }

  /**
   * Get the transaction history with parameters for the argued address.
   * @param {string} address
   * @param {TransactionFiltersInput} [filters]
   * @returns {Promise<TransactionConnection>}
   * @memberof Bitcoin
   */
  async getTransactionsForAddress(
    address: string,
    filters?: TransactionFiltersInput
  ): Promise<TransactionConnection> {
    if (!this.#ctx) {
      throw new Error("API context object not available");
    }

    const resp = await this.#ctx.dataSources.blockchainInfo.getRawAddressData(
      address,
      filters?.offset ?? undefined
    );

    const nodes: Transaction[] = resp.txs.map((t) =>
      NodeBuilder.transaction(this.id(), {
        block: t.block_index,
        fee: `${ethers.utils.formatUnits(t.fee, this.decimals())} BTC`,
        hash: t.hash,
        raw: t,
        timestamp: new Date(t.time).toISOString(),
        type: "standard",
      })
    );

    const hasNext = resp.n_tx > (filters?.offset ?? 0) + 50;
    const hasPrevious = filters?.offset ? filters.offset > 0 : false;
    return createConnection(nodes, hasNext, hasPrevious);
  }
}
