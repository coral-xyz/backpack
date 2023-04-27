import {
  AssetTransfersCategory,
  type AssetTransfersParams,
  BigNumber,
  SortingOrder,
} from "alchemy-sdk";
import { ethers } from "ethers";

import type { ApiContext } from "../context";
import {
  type Balances,
  ChainId,
  type Nft,
  type NftConnection,
  type TokenBalance,
  type TransactionConnection,
} from "../types";
import { createConnection } from "..";

import { type Blockchain, calculateUsdChange } from ".";

export class Ethereum implements Blockchain {
  readonly #ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.#ctx = ctx;
  }

  /**
   * Fetch and aggregate the native and token balances and
   * prices for the argued wallet address.
   * @param {string} address
   * @returns {(Promise<Balances | null>)}
   * @memberof Ethereum
   */
  async getBalancesForAddress(address: string): Promise<Balances | null> {
    // Fetch the native and all token balances of the address and filter out the empty balances
    const native = await this.#ctx.dataSources.alchemy.core.getBalance(address);
    const tokenBalances =
      await this.#ctx.dataSources.alchemy.core.getTokensForOwner(address);

    const nonEmptyTokens = tokenBalances.tokens.filter(
      (t) => (t.rawBalance ?? "0") !== "0"
    );

    // Get price data from Coingecko for the discovered tokens
    const prices = await this.#ctx.dataSources.coinGecko.getPrices([
      "ethereum",
    ]);

    // Map the non-empty token balances to their schema type
    const nodes: TokenBalance[] = nonEmptyTokens.map((t) => {
      const amt = BigNumber.from(t.rawBalance ?? "0");
      return {
        id: `ethereum_token_address:${address}/${t.contractAddress}`,
        address: `${address}/${t.contractAddress}`,
        amount: amt.toString(),
        decimals: t.decimals ?? 0,
        displayAmount: t.balance ?? "0",
        marketData: null, // FIXME:TODO:
        mint: t.contractAddress,
      };
    });

    return {
      aggregateValue: 0,
      native: {
        id: `ethereum_native_address:${address}`,
        address,
        amount: native.toString(),
        decimals: this.nativeDecimals(),
        displayAmount: ethers.utils.formatUnits(native, this.nativeDecimals()),
        marketData: {
          id: "coingecko_market_data:ethereum",
          percentChange: parseFloat(prices.ethereum.usd_24h_change.toFixed(2)),
          usdChange: calculateUsdChange(
            prices.ethereum.usd_24h_change,
            prices.ethereum.usd
          ),
          lastUpdatedAt: prices.ethereum.last_updated_at,
          logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png",
          price: prices.ethereum.usd,
          value:
            parseFloat(
              ethers.utils.formatUnits(native, this.nativeDecimals())
            ) * prices.ethereum.usd,
        },
        mint: "0x0000000000000000000000000000000000000000",
      },
      tokens: createConnection(nodes, false, false),
    };
  }

  /**
   * Get a list of NFT data for tokens owned by the argued address.
   * @param {string} address
   * @returns {Promise<NftConnection | null>}
   * @memberof Ethereum
   */
  async getNftsForAddress(address: string): Promise<NftConnection | null> {
    // Get all NFTs held by the address from Alchemy
    const nfts = await this.#ctx.dataSources.alchemy.nft.getNftsForOwner(
      address
    );

    // Return an array of `Nft` schema types after filtering out all
    // detected spam NFTs and mapping them with their possible collection data
    const nodes = nfts.ownedNfts.reduce<Nft[]>((acc, curr) => {
      if (curr.spamInfo?.isSpam ?? false) return acc;
      const n: Nft = {
        id: `ethereum_nft:${curr.contract.address}/${curr.tokenId}`,
        address: `${curr.contract.address}/${curr.tokenId}`,
        collection: curr.contract.openSea
          ? {
              id: `ethereum_nft_collection:${curr.contract.address}`,
              address: curr.contract.address,
              name: curr.contract.openSea.collectionName,
              image: curr.contract.openSea.imageUrl,
              verified:
                curr.contract.openSea.safelistRequestStatus === "verified",
            }
          : undefined,
        image: curr.rawMetadata?.image,
        name: curr.title,
      };
      return [...acc, n];
    }, []);

    return createConnection(nodes, false, false);
  }

  /**
   * Get the transaction history with parameters for the argued address.
   * @param {string} address
   * @param {string} [before]
   * @param {string} [after]
   * @returns {(Promise<TransactionConnection | null>)}
   * @memberof Ethereum
   */
  async getTransactionsForAddress(
    address: string,
    before?: string,
    after?: string
  ): Promise<TransactionConnection | null> {
    const params: AssetTransfersParams = {
      category: [
        AssetTransfersCategory.ERC1155,
        AssetTransfersCategory.ERC20,
        AssetTransfersCategory.ERC721,
        AssetTransfersCategory.EXTERNAL,
        AssetTransfersCategory.SPECIALNFT,
      ],
      fromBlock: after,
      order: SortingOrder.DESCENDING,
      toBlock: before,
      withMetadata: true,
    };

    const txs = await Promise.allSettled([
      this.#ctx.dataSources.alchemy.core.getAssetTransfers({
        fromAddress: address,
        ...params,
      }),
      this.#ctx.dataSources.alchemy.core.getAssetTransfers({
        toAddress: address,
        ...params,
      }),
    ]);

    const combined = txs
      .filter(isFulfilled)
      .map((t) => t.value.transfers)
      .flat()
      .sort((a, b) => Number(b.blockNum) - Number(a.blockNum));

    const nodes = combined.map((tx) => ({
      id: `ethereum_transaction:${tx.uniqueId}`,
      block: Number(tx.blockNum),
      feePayer: tx.from,
      hash: tx.hash,
      timestamp: (tx as any).metadata?.blockTimestamp || undefined,
      type: tx.category,
    }));

    return createConnection(nodes, false, false); // FIXME: next and previous page
  }

  /**
   * Chain ID enum variant.
   * @returns {ChainId}
   * @memberof Ethereum
   */
  id(): ChainId {
    return ChainId.Ethereum;
  }

  /**
   * Native coin decimals.
   * @returns {number}
   * @memberof Ethereum
   */
  nativeDecimals(): number {
    return 18;
  }
}

/**
 * Utility to determine the result type of settled promise.
 * @template T
 * @param {PromiseSettledResult<T>} input
 * @returns {input is PromiseFulfilledResult<T>}
 */
const isFulfilled = <T>(
  input: PromiseSettledResult<T>
): input is PromiseFulfilledResult<T> => input.status === "fulfilled";
