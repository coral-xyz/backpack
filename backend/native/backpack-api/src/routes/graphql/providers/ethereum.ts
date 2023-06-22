import { EthereumTokenList } from "@coral-xyz/common";
import {
  AssetTransfersCategory,
  type AssetTransfersParams,
  type AssetTransfersWithMetadataResponse,
  SortingOrder,
} from "alchemy-sdk";
import { ethers } from "ethers";

import type { CoinGeckoPriceData } from "../clients/coingecko";
import type { ApiContext } from "../context";
import { NodeBuilder } from "../nodes";
import {
  type BalanceFiltersInput,
  type Balances,
  type Nft,
  type NftAttribute,
  type NftConnection,
  type NftFiltersInput,
  ProviderId,
  type TokenBalance,
  type TransactionConnection,
  type TransactionFiltersInput,
} from "../types";
import { calculateBalanceAggregate, createConnection } from "../utils";

import type { BlockchainDataProvider } from ".";

/**
 * Ethereum blockchain implementation for the common API.
 * @export
 * @class Ethereum
 * @implements {BlockchainDataProvider}
 */
export class Ethereum implements BlockchainDataProvider {
  readonly #ctx?: ApiContext;

  constructor(ctx?: ApiContext) {
    this.#ctx = ctx;
  }

  /**
   * Chain ID enum variant.
   * @returns {ProviderId}
   * @memberof Ethereum
   */
  id(): ProviderId {
    return ProviderId.Ethereum;
  }

  /**
   * Native coin decimals.
   * @returns {number}
   * @memberof Ethereum
   */
  decimals(): number {
    return 18;
  }

  /**
   * Default native address.
   * @returns {string}
   * @memberof Ethereum
   */
  defaultAddress(): string {
    return "0x0000000000000000000000000000000000000000";
  }

  /**
   * Logo of the native coin.
   * @returns {string}
   * @memberof Ethereum
   */
  logo(): string {
    return EthereumTokenList[this.defaultAddress()].logo!;
  }

  /**
   * The display name of the data provider.
   * @returns {string}
   * @memberof Ethereum
   */
  name(): string {
    return "Ethereum";
  }

  /**
   * Symbol of the native coin.
   * @returns {string}
   * @memberof Ethereum
   */
  symbol(): string {
    return "ETH";
  }

  /**
   * Fetch and aggregate the native and token balances and
   * prices for the argued wallet address.
   * @param {string} address
   * @param {BalanceFiltersInput} [filters]
   * @returns {Promise<Balances>}
   * @memberof Ethereum
   */
  async getBalancesForAddress(
    address: string,
    filters?: BalanceFiltersInput
  ): Promise<Balances> {
    if (!this.#ctx) {
      throw new Error("API context object not available");
    }

    // Fetch the native and all token balances of the address and filter out the empty balances
    const [native, tokenBalances] = await Promise.all([
      this.#ctx.dataSources.alchemy.core.getBalance(address),
      this.#ctx.dataSources.alchemy.core.getTokensForOwner(address),
    ]);

    const nonEmptyTokens = tokenBalances.tokens.filter(
      (t) => (t.rawBalance ?? "0") !== "0"
    );

    const meta = nonEmptyTokens.reduce<Map<string, string>>((acc, curr) => {
      const id = EthereumTokenList[curr.contractAddress];
      if (id && id.coingeckoId) {
        acc.set(curr.contractAddress, id.coingeckoId);
      }
      return acc;
    }, new Map());

    // Get price data from Coingecko for the discovered tokens
    const ids = [...meta.values()];
    const prices = await this.#ctx.dataSources.coinGecko.getPrices([
      "ethereum",
      ...ids,
    ]);

    // Build the token balance node for the native balance of the wallet
    const nativeDisplayAmount = ethers.utils.formatUnits(
      native,
      this.decimals()
    );

    const nativeTokenNode = NodeBuilder.tokenBalance(
      this.id(),
      {
        address,
        amount: native.toString(),
        decimals: this.decimals(),
        displayAmount: nativeDisplayAmount,
        marketData: NodeBuilder.marketData("ethereum", {
          lastUpdatedAt: prices.ethereum.last_updated,
          percentChange: prices.ethereum.price_change_percentage_24h,
          price: prices.ethereum.current_price,
          sparkline: prices.ethereum.sparkline_in_7d.price,
          usdChange: prices.ethereum.price_change_24h,
          value:
            parseFloat(nativeDisplayAmount) * prices.ethereum.current_price,
          valueChange:
            parseFloat(nativeDisplayAmount) * prices.ethereum.price_change_24h,
        }),
        token: this.defaultAddress(),
        tokenListEntry: NodeBuilder.tokenListEntry(
          EthereumTokenList[this.defaultAddress()]
        ),
      },
      true
    );

    // Map the non-empty token balances to their schema type
    const ercTokenNodes = nonEmptyTokens.reduce<TokenBalance[]>((acc, curr) => {
      const id = meta.get(curr.contractAddress);
      const p: CoinGeckoPriceData | null = prices[id ?? ""] ?? null;

      const amount = curr.rawBalance ?? "0";
      const displayAmount = curr.balance ?? "0";

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

      const tokenListEntry = EthereumTokenList[curr.contractAddress]
        ? NodeBuilder.tokenListEntry(EthereumTokenList[curr.contractAddress])
        : undefined;

      if (filters?.marketListedTokensOnly && !marketData) {
        return acc;
      }

      return [
        ...acc,
        NodeBuilder.tokenBalance(
          this.id(),
          {
            address: `${address}/${curr.contractAddress}`,
            amount,
            decimals: curr.decimals ?? 0,
            displayAmount,
            marketData,
            token: curr.contractAddress,
            tokenListEntry,
          },
          false,
          `${address}/${curr.contractAddress}`
        ),
      ];
    }, []);

    // Combine the native and ERC token balance nodes and sort by total market value decreasing
    const tokenNodes = [nativeTokenNode, ...ercTokenNodes].sort(
      (a, b) => (b.marketData?.value ?? 0) - (a.marketData?.value ?? 0)
    );

    return NodeBuilder.balances(address, this.id(), {
      aggregate: calculateBalanceAggregate(address, tokenNodes),
      tokens: createConnection(tokenNodes, false, false),
    });
  }

  /**
   * Get a list of NFT data for tokens owned by the argued address.
   * @param {string} address
   * @param {NftFiltersInput} [filters]
   * @returns {Promise<NftConnection>}
   * @memberof Ethereum
   */
  async getNftsForAddress(
    address: string,
    filters?: NftFiltersInput
  ): Promise<NftConnection> {
    if (!this.#ctx) {
      throw new Error("API context object not available");
    }

    // Get all NFTs held by the address from Alchemy
    const nfts = await this.#ctx.dataSources.alchemy.nft.getNftsForOwner(
      address,
      { contractAddresses: filters?.addresses ?? undefined }
    );

    // Return an array of `Nft` schema types after filtering out all
    // detected spam NFTs and mapping them with their possible collection data
    const nodes = nfts.ownedNfts.reduce<Nft[]>((acc, curr) => {
      if (curr.spamInfo?.isSpam ?? false) return acc;

      const collection = curr.contract.openSea
        ? NodeBuilder.nftCollection(this.id(), {
            address: curr.contract.address,
            name: curr.contract.openSea.collectionName,
            image: curr.contract.openSea.imageUrl,
            verified:
              curr.contract.openSea.safelistRequestStatus === "verified",
          })
        : undefined;

      const attributes: NftAttribute[] | undefined =
        curr.rawMetadata?.attributes?.map((a) => ({
          trait: a.trait_type || a.traitType,
          value: a.value,
        }));

      const n = NodeBuilder.nft(
        this.id(),
        {
          address: `${curr.contract.address}/${curr.tokenId}`,
          attributes,
          collection,
          compressed: false,
          description: curr.description || undefined,
          image: curr.rawMetadata?.image || undefined,
          metadataUri: curr.tokenUri?.raw || undefined,
          name: curr.title || undefined,
          owner: address,
          token: curr.tokenId,
        },
        `${curr.contract.address}/${curr.tokenId}`
      );
      return [...acc, n];
    }, []);

    return createConnection(nodes, false, false);
  }

  /**
   * Get the transaction history with parameters for the argued address.
   * @param {string} address
   * @param {TransactionFiltersInput} [filters]
   * @returns {Promise<TransactionConnection>}
   * @memberof Ethereum
   */
  async getTransactionsForAddress(
    address: string,
    filters?: TransactionFiltersInput
  ): Promise<TransactionConnection> {
    if (!this.#ctx) {
      throw new Error("API context object not available");
    }

    const params: AssetTransfersParams = {
      category: [
        AssetTransfersCategory.ERC1155,
        AssetTransfersCategory.ERC20,
        AssetTransfersCategory.ERC721,
        AssetTransfersCategory.EXTERNAL,
        AssetTransfersCategory.SPECIALNFT,
      ],
      contractAddresses: filters?.token ? [filters.token] : undefined,
      fromBlock: filters?.after ?? undefined,
      order: SortingOrder.DESCENDING,
      toBlock: filters?.before ?? undefined,
      withMetadata: true,
    };

    const txs = await Promise.allSettled([
      this.#ctx.dataSources.alchemy.core.getAssetTransfers({
        fromAddress: address,
        ...params,
      }) as Promise<AssetTransfersWithMetadataResponse>,
      this.#ctx.dataSources.alchemy.core.getAssetTransfers({
        toAddress: address,
        ...params,
      }) as Promise<AssetTransfersWithMetadataResponse>,
    ]);

    const combined = txs
      .filter(_isFulfilled)
      .map((t) => t.value.transfers)
      .flat()
      .sort((a, b) => Number(b.blockNum) - Number(a.blockNum));

    const receipts = await Promise.all(
      combined.map((tx) =>
        this.#ctx!.dataSources.alchemy.core.getTransactionReceipt(tx.hash)
      )
    );

    const nodes = combined.map((tx, i) => {
      const nfts = tx.erc721TokenId
        ? [`${tx.rawContract.address}/${tx.erc721TokenId}`]
        : tx.erc1155Metadata && tx.erc1155Metadata.length > 0
        ? tx.erc1155Metadata.map(
            (t) => `${tx.rawContract.address}/${t.tokenId}`
          )
        : undefined;

      return NodeBuilder.transaction(
        this.id(),
        {
          block: Number(tx.blockNum),
          fee:
            receipts[i]?.gasUsed && receipts[i]?.effectiveGasPrice
              ? `${ethers.utils.formatUnits(
                  receipts[i]!.gasUsed.mul(receipts[i]!.effectiveGasPrice),
                  this.decimals()
                )} ${this.symbol()}`
              : undefined,
          feePayer: tx.from,
          hash: tx.hash,
          nfts,
          raw: tx,
          timestamp: new Date(tx.metadata.blockTimestamp).toISOString(),
          type: tx.category,
        },
        tx.uniqueId
      );
    });

    return createConnection(nodes, false, false); // FIXME: next and previous page
  }
}

/**
 * Utility to determine the result type of settled promise.
 * @template T
 * @param {PromiseSettledResult<T>} input
 * @returns {input is PromiseFulfilledResult<T>}
 */
const _isFulfilled = <T>(
  input: PromiseSettledResult<T>
): input is PromiseFulfilledResult<T> => input.status === "fulfilled";
