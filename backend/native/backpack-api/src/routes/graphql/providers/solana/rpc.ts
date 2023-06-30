import {
  type CustomTokenList,
  externalResourceUri,
  SolanaTokenList,
  TOKEN_PROGRAM_ID,
} from "@coral-xyz/common";
import {
  type FindNftsByMintListOutput,
  type JsonMetadata,
  Metaplex,
} from "@metaplex-foundation/js";
import {
  deserializeAccount,
  deserializeMint,
  getATAAddressSync,
  type TokenAccountData,
} from "@saberhq/token-utils";
import type { MintInfo } from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";
import { ethers } from "ethers";

import { HELIUS_API_KEY } from "../../../../config";
import type { CoinGeckoPriceData } from "../../clients/coingecko";
import { IN_MEM_SOL_COLLECTION_DATA_CACHE } from "../../clients/helius";
import type { ApiContext } from "../../context";
import { NodeBuilder } from "../../nodes";
import type {
  BalanceFiltersInput,
  Balances,
  Nft,
  NftConnection,
  NftFiltersInput,
  TokenBalance,
  Transaction,
  TransactionConnection,
  TransactionFiltersInput,
} from "../../types";
import { ProviderId } from "../../types";
import { calculateBalanceAggregate, createConnection } from "../../utils";
import type { BlockchainDataProvider } from "..";
import { createMarketDataNode, sortTokenBalanceNodes } from "../util";

export type SolanaRpcProviderSettings = {
  context?: ApiContext;
  customRpc?: string;
  tokenList?: CustomTokenList;
};

/**
 * Solana blockchain implementation for the common API sourced by raw RPC calls.
 * @export
 * @class SolanaRpc
 * @implements {BlockchainDataProvider}
 */
export class SolanaRpc implements BlockchainDataProvider {
  protected readonly ctx?: ApiContext;
  protected readonly tokenList: CustomTokenList;

  readonly #connection: Connection;
  readonly #mpl: Metaplex;

  constructor(opts: SolanaRpcProviderSettings) {
    this.#connection = new Connection(this._getRpcUrl(opts), "confirmed");
    this.#mpl = Metaplex.make(this.#connection);
    this.ctx = opts.context;
    this.tokenList = opts.tokenList ?? SolanaTokenList;
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
    return this.tokenList.native.address;
  }

  /**
   * Logo URL of the native coin.
   * @returns {string}
   * @memberof SolanaRpc
   */
  logo(): string {
    return this.tokenList.native.logo!;
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
      const entry = this.tokenList[curr];
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
        marketData: createMarketDataNode(
          nativeDisplayAmount,
          "solana",
          prices.solana
        ),
        token: this.defaultAddress(),
        tokenListEntry: NodeBuilder.tokenListEntry(this.tokenList["native"]),
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

        const marketData = createMarketDataNode(displayAmount, id, p);
        const tokenListEntry = this.tokenList[curr.data.mint.toBase58()]
          ? NodeBuilder.tokenListEntry(
              this.tokenList[curr.data.mint.toBase58()]
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
    const tokenNodes = sortTokenBalanceNodes([
      nativeTokenNode,
      ...splTokenNodes,
    ]);

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
   */
  async getNftsForAddress(
    address: string,
    filters?: NftFiltersInput | undefined
  ): Promise<NftConnection> {
    if (!this.ctx) {
      throw new Error("API context object not available");
    }

    // Query for all NFTs owned by the argued wallet address
    let nfts: FindNftsByMintListOutput;
    if (filters?.addresses && filters.addresses.length > 0) {
      nfts = await this.#mpl
        .nfts()
        .findAllByMintList({
          mints: filters?.addresses?.map((addr) => new PublicKey(addr)),
        })
        .run();
    } else {
      nfts = await this.#mpl
        .nfts()
        .findAllByOwner({ owner: new PublicKey(address) })
        .run();
    }

    // Attempt to fetch all of the off-chain metadata for each NFT
    const metadatas = await Promise.all(
      nfts.map((n) => {
        if (!n) {
          return Promise.resolve(null);
        } else if (n?.json) {
          return Promise.resolve(n.json);
        }

        // If the JSON metadata doesn't already exist on the object, try to fetch it
        return this.#mpl
          .storage()
          .downloadJson<JsonMetadata>(externalResourceUri(n.uri));
      })
    );

    // Construct the `Nft` schema nodes from the gathered data
    const nodes: Nft[] = nfts.reduce<Nft[]>((acc, curr, idx) => {
      if (curr) {
        const meta = metadatas[idx];
        const ata = getATAAddressSync({
          mint: curr.address,
          owner: new PublicKey(address),
        });

        // Try to get the collection metadata from the in-memory cache
        const collectionData = IN_MEM_SOL_COLLECTION_DATA_CACHE.get(
          curr.collection?.address?.toBase58() ?? ""
        );

        const node = NodeBuilder.nft(this.id(), {
          address: curr.address.toBase58(),
          collection: curr.collection
            ? NodeBuilder.nftCollection(this.id(), {
                address: curr.collection.address.toBase58(),
                image: collectionData?.image,
                name: collectionData?.name,
                verified: curr.collection.verified,
              })
            : undefined,
          compressed: false,
          owner: address,
          token: ata.toBase58(),
          metadataUri: curr.uri,
          name: curr.name,
        });

        // Attach the additional optional information about the NFT if the metadata was found
        if (meta) {
          node.attributes = meta.attributes?.map((a) => ({
            trait: a.trait_type ?? "",
            value: a.value ?? "",
          }));
          node.description = meta.description;
          node.image = meta.image;
        }

        acc.push(node);
      }
      return acc;
    }, []);

    return createConnection(nodes, false, false);
  }

  /**
   * Get the transaction history with parameters for the argued address.
   * @override
   * @param {string} address
   * @param {TransactionFiltersInput} [filters]
   * @returns {Promise<TransactionConnection>}
   * @memberof SolanaRpc
   */
  async getTransactionsForAddress(
    address: string,
    filters?: TransactionFiltersInput | undefined
  ): Promise<TransactionConnection> {
    // Get the most recent transaction signatures for the argued address and pagination parameters
    const signatures = await this.#connection.getSignaturesForAddress(
      new PublicKey(address),
      {
        limit: 50,
        before: filters?.before ?? undefined,
        until: filters?.after ?? undefined,
      }
    );

    // Fetch the parsed transactions for each of the found signatures
    const transactions = await this.#connection.getTransactions(
      signatures.map((s) => s.signature),
      { maxSupportedTransactionVersion: 0 }
    );

    // Filter out the `null` transactions and compile the remainders into `Transaction` schema nodes
    const nodes = transactions.reduce<Transaction[]>((acc, curr, idx) => {
      if (curr) {
        acc.push(
          NodeBuilder.transaction(this.id(), {
            block: curr.slot,
            error: curr.meta?.err?.toString(),
            fee: curr.meta?.fee
              ? `${ethers.utils.formatUnits(
                  curr.meta.fee,
                  this.decimals()
                )} SOL`
              : undefined,
            feePayer: curr.transaction.message.staticAccountKeys[0].toBase58(),
            hash: signatures[idx].signature,
            raw: JSON.parse(JSON.stringify(curr)),
            timestamp: curr.blockTime
              ? new Date(curr.blockTime * 1000).toISOString()
              : new Date().toISOString(),
            type: "standard",
          })
        );
      }
      return acc;
    }, []);

    // Construct and return the transaction connection object
    return createConnection(
      nodes,
      filters?.after !== undefined,
      filters?.before !== undefined
    );
  }

  /**
   * Return the target RPC endpoint that should be used based on context.
   * @private
   * @param {SolanaRpcProviderSettings} settings
   * @returns {string}
   * @memberof SolanaRpc
   */
  private _getRpcUrl({
    context,
    customRpc,
  }: SolanaRpcProviderSettings): string {
    return context?.network.rpc ?? customRpc ?? context?.network.devnet
      ? `https://rpc-devnet.helius.xyz/?api-key=${HELIUS_API_KEY}`
      : "https://rpc-proxy.backpack.workers.dev";
  }
}
