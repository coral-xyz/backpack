import { SolanaTokenList, TOKEN_PROGRAM_ID } from "@coral-xyz/common";
import {
  deserializeAccount,
  deserializeMint,
  type TokenAccountData,
} from "@saberhq/token-utils";
import type { MintInfo } from "@solana/spl-token";
import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import { ethers } from "ethers";

import { HELIUS_API_KEY } from "../../../../config";
import type { CoinGeckoPriceData } from "../../clients/coingecko";
import type { ApiContext } from "../../context";
import { NodeBuilder } from "../../nodes";
import {
  type BalanceFiltersInput,
  type Balances,
  type NftConnection,
  type NftFiltersInput,
  ProviderId,
  type TokenBalance,
  type TransactionConnection,
  type TransactionFiltersInput,
} from "../../types";
import { calculateBalanceAggregate, createConnection } from "../../utils";
import type { BlockchainDataProvider } from "..";

/**
 * Solana blockchain implementation for the common API sourced by raw RPC calls.
 * @export
 * @class SolanaRpc
 * @implements {BlockchainDataProvider}
 */
export class SolanaRpc implements BlockchainDataProvider {
  protected readonly ctx?: ApiContext;
  readonly #connection: Connection;

  constructor(ctx?: ApiContext) {
    const rpcUrl =
      ctx?.network.rpc ??
      (ctx?.network.devnet
        ? `https://rpc-devnet.helius.xyz/?api-key=${HELIUS_API_KEY}`
        : `https://rpc.helius.xyz/?api-key=${HELIUS_API_KEY}`);

    this.#connection = new Connection(rpcUrl, "confirmed");
    this.ctx = ctx;
  }

  /**
   * Chain ID enum variant.
   * @returns {ProviderId}
   * @memberof SolanaRpc
   */
  id(): ProviderId {
    return ProviderId.Solana;
  }

  /**
   * Native coin decimals.
   * @returns {number}
   * @memberof SolanaRpc
   */
  decimals(): number {
    return 9;
  }

  /**
   * Default native address.
   * @returns {string}
   * @memberof SolanaRpc
   */
  defaultAddress(): string {
    return SystemProgram.programId.toBase58();
  }

  /**
   * Logo URL of the native coin.
   * @returns {string}
   * @memberof SolanaRpc
   */
  logo(): string {
    return SolanaTokenList[this.defaultAddress()].logo!;
  }

  /**
   * The display name of the data provider.
   * @returns {string}
   * @memberof SolanaRpc
   */
  name(): string {
    return "Solana";
  }

  /**
   * Symbol of the native token.
   * @returns {string}
   * @memberof SolanaRpc
   */
  symbol(): string {
    return "SOL";
  }

  /**
   * Fetch and aggregate the native and token balances and
   * prices for the argued wallet address.
   * @param {string} address
   * @param {BalanceFiltersInput} [filters]
   * @returns {Promise<Balances>}
   * @memberof SolanaRpc
   */
  async getBalancesForAddress(
    address: string,
    filters?: BalanceFiltersInput | undefined
  ): Promise<Balances> {
    if (!this.ctx) {
      throw new Error("API context object not available");
    }

    // RPC calls to get the native balance and all token accounts
    // owned by the argued wallet address
    const pk = new PublicKey(address);
    const balance = await this.#connection.getBalance(pk);
    const atas = await this.#connection.getTokenAccountsByOwner(pk, {
      programId: TOKEN_PROGRAM_ID,
    });

    // Filter out the empty token accounts
    const nonEmptyTokens = atas.value.reduce<
      { publicKey: string; data: TokenAccountData }[]
    >((acc, curr) => {
      const data = deserializeAccount(curr.account.data);
      if (data.amount.gtn(0)) {
        acc.push({ publicKey: curr.pubkey.toBase58(), data });
      }
      return acc;
    }, []);

    // RPC calls to fetch and deserialize the account info for each found token mint
    const atasMints = nonEmptyTokens.map((t) => t.data.mint.toBase58());
    const mintAccountInfos = await this.#connection.getMultipleAccountsInfo(
      atasMints.map((m) => new PublicKey(m))
    );
    const mintAccountDatas = mintAccountInfos.reduce<Record<string, MintInfo>>(
      (acc, curr, idx) => {
        if (curr) {
          acc[atasMints[idx]] = deserializeMint(curr.data);
        }
        return acc;
      },
      {}
    );

    // Further filter out the NFT matching token accounts
    const nonEmptyOrNftTokens = nonEmptyTokens.filter(
      (t) =>
        !(
          t.data.amount.eqn(1) &&
          (mintAccountDatas[t.data.mint.toBase58()]?.decimals ?? 0) === 0
        )
    );

    // Attempt to get the Coingecko IDs for each of the token account mints
    const meta = atasMints.reduce<Map<string, string>>((acc, curr) => {
      const entry = SolanaTokenList[curr];
      if (entry && entry.coingeckoId) {
        acc.set(curr, entry.coingeckoId);
      }
      return acc;
    }, new Map());

    // Query for the indexed Coingecko price data for each mint ID
    const ids = [...meta.values()];
    const prices = await this.ctx.dataSources.coinGecko.getPrices([
      "solana",
      ...ids,
    ]);

    // Calculate and construct the token balance schema node for the native wallet balance
    const nativeDisplayAmount = ethers.utils.formatUnits(
      balance,
      this.decimals()
    );

    const nativeTokenNode = NodeBuilder.tokenBalance(
      this.id(),
      {
        address,
        amount: balance.toString(),
        decimals: this.decimals(),
        displayAmount: nativeDisplayAmount,
        marketData: NodeBuilder.marketData("solana", {
          lastUpdatedAt: prices.solana.last_updated,
          percentChange: prices.solana.price_change_percentage_24h,
          price: prices.solana.current_price,
          sparkline: prices.solana.sparkline_in_7d.price,
          usdChange: prices.solana.price_change_24h,
          value: parseFloat(nativeDisplayAmount) * prices.solana.current_price,
          valueChange:
            parseFloat(nativeDisplayAmount) * prices.solana.price_change_24h,
        }),
        token: this.defaultAddress(),
        tokenListEntry: NodeBuilder.tokenListEntry(
          SolanaTokenList[this.defaultAddress()]
        ),
      },
      true
    );

    // Calculate and construct the token balance schema node for each of the
    // non-filtered out and discovered associated token accounts
    const splTokenNodes = nonEmptyOrNftTokens.reduce<TokenBalance[]>(
      (acc, curr) => {
        const id = meta.get(curr.data.mint.toBase58());
        const p: CoinGeckoPriceData | null = prices[id ?? ""] ?? null;

        const mintDecimals =
          mintAccountDatas[curr.data.mint.toBase58()]?.decimals ?? 0;
        const displayAmount = ethers.utils.formatUnits(
          curr.data.amount.toString(),
          mintDecimals
        );

        const marketData =
          p && id
            ? NodeBuilder.marketData(id, {
                lastUpdatedAt: p.last_updated,
                percentChange: p.price_change_percentage_24h,
                price: p.current_price,
                sparkline: p.sparkline_in_7d.price,
                usdChange: p.price_change_24h,
                value: parseFloat(displayAmount) * p.current_price,
                valueChange: parseFloat(displayAmount) * p.price_change_24h,
              })
            : undefined;

        const tokenListEntry = SolanaTokenList[curr.data.mint.toBase58()]
          ? NodeBuilder.tokenListEntry(
              SolanaTokenList[curr.data.mint.toBase58()]
            )
          : undefined;

        if (filters?.marketListedTokensOnly && !marketData) {
          return acc;
        }

        return [
          ...acc,
          NodeBuilder.tokenBalance(
            this.id(),
            {
              address: curr.publicKey,
              amount: curr.data.amount.toString(),
              decimals: mintDecimals,
              displayAmount,
              marketData,
              token: curr.data.mint.toBase58(),
              tokenListEntry,
            },
            false
          ),
        ];
      },
      []
    );

    // Sort the native and token account nodes by market value decreasing
    const tokenNodes = [nativeTokenNode, ...splTokenNodes].sort(
      (a, b) => (b.marketData?.value ?? 0) - (a.marketData?.value ?? 0)
    );

    // Construct and return the balances schema node
    return NodeBuilder.balances(address, this.id(), {
      aggregate: calculateBalanceAggregate(address, tokenNodes),
      tokens: createConnection(tokenNodes, false, false),
    });
  }

  /**
   * Get a list of NFT data for tokens owned by the argued address.
   * @override
   * @param {string} address
   * @param {NftFiltersInput} [filters]
   * @returns {Promise<NftConnection>}
   * @memberof SolanaRpc
   * TODO:
   */
  async getNftsForAddress(
    address: string,
    filters?: NftFiltersInput | undefined
  ): Promise<NftConnection> {
    throw new Error("Method not implemented.");
  }

  /**
   * Get the transaction history with parameters for the argued address.
   * @override
   * @param {string} address
   * @param {TransactionFiltersInput} [filters]
   * @returns {Promise<TransactionConnection>}
   * @memberof SolanaRpc
   * TODO:
   */
  async getTransactionsForAddress(
    address: string,
    filters?: TransactionFiltersInput | undefined
  ): Promise<TransactionConnection> {
    throw new Error("Method not implemented.");
  }
}
