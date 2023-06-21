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
    return ""; // FIXME:
  }

  /**
   * Logo of the native coin.
   * @returns {string}
   * @memberof Bitcoin
   */
  logo(): string {
    return "https://assets.coingecko.com/coins/images/1/large/bitcoin.png";
  }

  /**
   * The display name of the data provider.
   * @returns {string}
   * @memberof Bitcoin
   */
  name(): string {
    return "Bitcoin";
  }

  /**
   * Symbol of the native coin.
   * @returns {string}
   * @memberof Bitcoin
   */
  symbol(): string {
    return "BTC";
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
          marketData: NodeBuilder.marketData("bitcoin", {
            lastUpdatedAt: prices.bitcoin.last_updated,
            percentChange: prices.bitcoin.price_change_percentage_24h,
            price: prices.bitcoin.current_price,
            sparkline: prices.bitcoin.sparkline_in_7d.price,
            usdChange: prices.bitcoin.price_change_24h,
            value: parseFloat(displayAmount) * prices.bitcoin.current_price,
            valueChange:
              parseFloat(displayAmount) * prices.bitcoin.price_change_24h,
          }),
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

  getNftsForAddress(
    address: string,
    filters?: NftFiltersInput | undefined
  ): Promise<NftConnection> {
    throw new Error("Method not implemented.");
  }

  /**
   * Get the transaction history with parameters for the argued address.
   * @param {string} address
   * @param {TransactionFiltersInput} [_filters]
   * @returns {Promise<TransactionConnection>}
   * @memberof Bitcoin
   */
  async getTransactionsForAddress(
    address: string,
    _filters?: TransactionFiltersInput
  ): Promise<TransactionConnection> {
    if (!this.#ctx) {
      throw new Error("API context object not available");
    }

    const txs = await this.#ctx.dataSources.blockchainInfo.getRawAddressData(
      address
    );

    const nodes: Transaction[] = txs.map((t) =>
      NodeBuilder.transaction(this.id(), {
        block: t.block_index,
        fee: t.fee.toString(),
        hash: t.hash,
        raw: t,
        timestamp: new Date(t.time).toISOString(),
        type: "standard",
      })
    );

    return createConnection(nodes, false, false); // FIXME: add pagination with limitation filter
  }
}
