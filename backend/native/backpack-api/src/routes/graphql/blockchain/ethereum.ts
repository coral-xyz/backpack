import {
  AssetTransfersCategory,
  type AssetTransfersParams,
  BigNumber,
  SortingOrder,
} from "alchemy-sdk";
import { ethers } from "ethers";

import type { ApiContext } from "../context";
import {
  ChainId,
  type Nft,
  type TokenBalance,
  type Transaction,
  type WalletBalances,
} from "../types";

import type { Blockchain } from ".";

export class Ethereum implements Blockchain {
  readonly #ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.#ctx = ctx;
  }

  /**
   * Fetch and aggregate the native and token balances and
   * prices for the argued wallet address.
   * @param {string} address
   * @returns {(Promise<WalletBalances | null>)}
   * @memberof Ethereum
   */
  async getBalancesForAddress(address: string): Promise<WalletBalances | null> {
    // Fetch the native and all token balances of the address and filter out the empty balances
    const native = await this.#ctx.dataSources.alchemy.core.getBalance(address);
    const tokenBalances =
      await this.#ctx.dataSources.alchemy.core.getTokensForOwner(address);

    const nonEmptyTokens = tokenBalances.tokens.filter(
      (t) => (t.rawBalance ?? "0") !== "0"
    );

    // Map the non-empty token balances to their schema type
    const tokens: TokenBalance[] = nonEmptyTokens.map((t) => {
      const amt = BigNumber.from(t.rawBalance ?? "0");
      return {
        id: `${address}/${t.contractAddress}`,
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
        id: address,
        amount: native.toString(),
        decimals: this.nativeDecimals(),
        displayAmount: ethers.utils.formatUnits(native, this.nativeDecimals()),
        marketData: null, // FIXME:TODO:
        mint: "",
      },
      tokens,
    };
  }

  /**
   * Get a list of NFT data for tokens owned by the argued address.
   * @param {string} address
   * @returns {Promise<any>}
   * @memberof Ethereum
   */
  async getNftsForAddress(address: string): Promise<Nft[] | null> {
    // Get all NFTs held by the address from Alchemy
    const nfts = await this.#ctx.dataSources.alchemy.nft.getNftsForOwner(
      address
    );

    // Return an array of `Nft` schema types after filtering out all
    // detected spam NFTs and mapping them with their possible collection data
    return nfts.ownedNfts.reduce<Nft[]>((acc, curr) => {
      if (curr.spamInfo?.isSpam ?? false) return acc;
      const n: Nft = {
        id: curr.tokenId,
        collection: curr.contract.openSea
          ? {
              id: curr.contract.address,
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
  }

  /**
   * Get the transaction history with parameters for the argued address.
   * @param {string} address
   * @param {string} [before]
   * @param {string} [after]
   * @returns {(Promise<Transaction[] | null>)}
   * @memberof Ethereum
   */
  async getTransactionsForAddress(
    address: string,
    before?: string,
    after?: string
  ): Promise<Transaction[] | null> {
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

    return combined.map((tx) => ({
      id: tx.hash,
      block: Number(tx.blockNum),
      feePayer: tx.from,
    }));
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
