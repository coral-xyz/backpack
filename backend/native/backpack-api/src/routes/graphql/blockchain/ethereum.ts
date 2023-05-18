import {
  AssetTransfersCategory,
  type AssetTransfersParams,
  type AssetTransfersResult,
  BigNumber,
  SortingOrder,
} from "alchemy-sdk";
import { ethers } from "ethers";

import type { ApiContext } from "../context";
import {
  type Balances,
  ChainId,
  type Collection,
  type Nft,
  type NftAttribute,
  type NftConnection,
  type NftFiltersInput,
  type TokenBalance,
  type Transaction,
  type TransactionConnection,
  type TransactionFiltersInput,
  type TransactionTransfer,
} from "../types";
import {
  calculateBalanceAggregate,
  calculateUsdChange,
  createConnection,
} from "../utils";

import type { Blockchain } from ".";

const ETH_DEFAULT_ADDRESS = "0x0000000000000000000000000000000000000000";

/**
 * Ethereum blockchain implementation for the common API.
 * @export
 * @class Ethereum
 * @implements {Blockchain}
 */
export class Ethereum implements Blockchain {
  readonly #ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.#ctx = ctx;
  }

  /**
   * Fetch and aggregate the native and token balances and
   * prices for the argued wallet address.
   * @param {string} address
   * @returns {Promise<Balances>}
   * @memberof Ethereum
   */
  async getBalancesForAddress(address: string): Promise<Balances> {
    // Fetch the native and all token balances of the address and filter out the empty balances
    const [native, tokenBalances] = await Promise.all([
      this.#ctx.dataSources.alchemy.core.getBalance(address),
      this.#ctx.dataSources.alchemy.core.getTokensForOwner(address),
    ]);

    const nonEmptyTokens = tokenBalances.tokens.filter(
      (t) => (t.rawBalance ?? "0") !== "0"
    );

    // Get price data from Coingecko for the discovered tokens
    const prices = await this.#ctx.dataSources.coinGecko.getPrices([
      "ethereum",
    ]);

    // Native token balance data
    const nativeData: TokenBalance = {
      id: `${this.id()}_native_address:${address}`,
      address,
      amount: native.toString(),
      decimals: this.nativeDecimals(),
      displayAmount: ethers.utils.formatUnits(native, this.nativeDecimals()),
      marketData: {
        id: this.#ctx.dataSources.coinGecko.id("ethereum"),
        percentChange: parseFloat(prices.ethereum.usd_24h_change.toFixed(2)),
        usdChange: calculateUsdChange(
          prices.ethereum.usd_24h_change,
          prices.ethereum.usd
        ),
        lastUpdatedAt: prices.ethereum.last_updated_at,
        logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png",
        price: prices.ethereum.usd,
        value:
          parseFloat(ethers.utils.formatUnits(native, this.nativeDecimals())) *
          prices.ethereum.usd,
        valueChange:
          parseFloat(ethers.utils.formatUnits(native, this.nativeDecimals())) *
          calculateUsdChange(
            prices.ethereum.usd_24h_change,
            prices.ethereum.usd
          ),
      },
      token: ETH_DEFAULT_ADDRESS,
    };

    // Map the non-empty token balances to their schema type
    const nodes: TokenBalance[] = nonEmptyTokens.map((t) => {
      const amt = BigNumber.from(t.rawBalance ?? "0");
      return {
        id: `${this.id()}_token_address:${address}/${t.contractAddress}`,
        address: `${address}/${t.contractAddress}`,
        amount: amt.toString(),
        decimals: t.decimals ?? 0,
        displayAmount: t.balance ?? "0",
        marketData: null, // FIXME:TODO:
        token: t.contractAddress,
      };
    });

    return {
      id: `${this.id()}_balances:${address}`,
      aggregate: calculateBalanceAggregate(address, [nativeData, ...nodes]),
      native: nativeData,
      tokens: createConnection(nodes, false, false),
    };
  }

  /**
   * Get a list of NFT data for tokens owned by the argued address.
   * @param {string} address
   * @param {Partial<NftFiltersInput>} [filters]
   * @returns {Promise<NftConnection>}
   * @memberof Ethereum
   */
  async getNftsForAddress(
    address: string,
    filters?: Partial<NftFiltersInput>
  ): Promise<NftConnection> {
    // Get all NFTs held by the address from Alchemy
    const nfts = await this.#ctx.dataSources.alchemy.nft.getNftsForOwner(
      address,
      { contractAddresses: filters?.addresses ?? undefined }
    );

    // Return an array of `Nft` schema types after filtering out all
    // detected spam NFTs and mapping them with their possible collection data
    const nodes = nfts.ownedNfts.reduce<Nft[]>((acc, curr) => {
      if (curr.spamInfo?.isSpam ?? false) return acc;

      const collection: Collection | undefined = curr.contract.openSea
        ? {
            id: `${this.id()}_nft_collection:${curr.contract.address}`,
            address: curr.contract.address,
            name: curr.contract.openSea.collectionName,
            image: curr.contract.openSea.imageUrl,
            verified:
              curr.contract.openSea.safelistRequestStatus === "verified",
          }
        : undefined;

      const attributes: NftAttribute[] | undefined =
        curr.rawMetadata?.attributes?.map((a) => ({
          trait: a.trait_type || a.traitType,
          value: a.value,
        }));

      const n: Nft = {
        id: `${this.id()}_nft:${curr.contract.address}/${curr.tokenId}`,
        address: `${curr.contract.address}/${curr.tokenId}`,
        attributes,
        collection,
        description: curr.description,
        image: curr.rawMetadata?.image,
        metadataUri: curr.tokenUri?.raw || "",
        name: curr.title,
        owner: address,
        token: curr.tokenId,
      };
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

    const nodes: Transaction[] = combined.map((tx) => {
      return {
        id: `${this.id()}_transaction:${tx.uniqueId}`,
        block: Number(tx.blockNum),
        fee: undefined, // FIXME: find gas amount paid for processing
        feePayer: tx.from,
        hash: tx.hash,
        raw: tx,
        timestamp: (tx as any).metadata?.blockTimestamp || undefined,
        transfers: generateTokenTransfers(tx),
        type: tx.category,
      };
    });

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
 * Infers and generates the list of token transfers that occured
 * in the argued transaction object.
 * @param {AssetTransfersResult} tx
 * @returns {TransactionTransfer[]}
 */
function generateTokenTransfers(
  tx: AssetTransfersResult
): TransactionTransfer[] {
  const transfers: TransactionTransfer[] = [];

  if (tx.value) {
    transfers.push({
      amount: tx.value,
      from: tx.from,
      to: tx.to ?? ETH_DEFAULT_ADDRESS,
      token: tx.rawContract.address ?? ETH_DEFAULT_ADDRESS,
      tokenName: tx.asset,
    });
  }

  if (tx.erc1155Metadata && tx.erc1155Metadata.length > 0) {
    transfers.push(
      ...tx.erc1155Metadata.map(
        (m): TransactionTransfer => ({
          amount: ethers.BigNumber.from(m.value).toNumber(),
          from: tx.from,
          to: tx.to ?? ETH_DEFAULT_ADDRESS,
          token: `${tx.rawContract.address}/${m.tokenId}`,
        })
      )
    );
  }

  if (tx.erc721TokenId) {
    transfers.push({
      amount: 1,
      from: tx.from,
      to: tx.to ?? ETH_DEFAULT_ADDRESS,
      token: `${tx.rawContract.address}/${tx.erc721TokenId}`,
      tokenName: tx.asset,
    });
  }

  return transfers;
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
