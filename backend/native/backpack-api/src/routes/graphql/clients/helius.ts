import { RESTDataSource } from "@apollo/datasource-rest";
import { getATAAddressSync } from "@saberhq/token-utils";
import type { AccountInfo } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import type { EnrichedTransaction } from "helius-sdk";
import { LRUCache } from "lru-cache";

export const IN_MEM_COLLECTION_DATA_CACHE = new LRUCache<
  string,
  { name?: string; image?: string }
>({
  allowStale: false,
  max: 1000,
  ttl: 1000 * 60 * 30, // 30 minute TTL
  ttlAutopurge: true,
});

type HeliusOptions = {
  apiKey: string;
  devnet?: boolean;
};

/**
 * Custom GraphQL REST data source class abstraction for Helius.
 * @export
 * @class Helius
 * @extends {RESTDataSource}
 */
export class Helius extends RESTDataSource {
  readonly #apiKey: string;
  readonly #rpcClient: HeliusRpc;

  override baseURL = "https://api.helius.xyz";

  constructor(opts: HeliusOptions) {
    super();
    this.#apiKey = opts.apiKey;
    if (opts.devnet) {
      this.baseURL = "https://api-devnet.helius.xyz";
    }
    this.#rpcClient = new HeliusRpc(opts);
  }

  /**
   * Helius RPC API client.
   * @readonly
   * @type {HeliusRpc}
   * @memberof Helius
   */
  get rpc(): HeliusRpc {
    return this.#rpcClient;
  }

  /**
   * Get the raw native and token balance data for the argued wallet address.
   * @param {string} address
   * @returns {Promise<HeliusGetBalancesResponse>}
   * @memberof Helius
   */
  async getBalances(address: string): Promise<HeliusGetBalancesResponse> {
    return this.get(`/v0/addresses/${address}/balances`, {
      params: {
        "api-key": this.#apiKey,
      },
    });
  }

  /**
   * Fetch the token metadata for all mints in the argued array.
   * @param {string[]} mints
   * @param {boolean} [includeOffChain]
   * @returns {Promise<HeliusGetTokenMetadataResponse>}
   * @memberof Helius
   */
  async getTokenMetadata(
    mints: string[],
    includeOffChain?: boolean
  ): Promise<HeliusGetTokenMetadataResponse> {
    return this.post("/v0/token-metadata", {
      headers: { "Content-Type": "application/json" },
      params: {
        "api-key": this.#apiKey,
      },
      body: JSON.stringify({
        mintAccounts: mints,
        includeOffChain: includeOffChain ?? false,
        disableCache: false,
      }),
    });
  }

  /**
   * Get the transaction history for the given address.
   * @param {string} address
   * @param {string} [before]
   * @param {string} [until]
   * @param {string} [mint]
   * @returns {Promise<EnrichedTransaction[]>}
   * @memberof Helius
   */
  async getTransactionHistory(
    address: string,
    before?: string,
    until?: string,
    mint?: string
  ): Promise<EnrichedTransaction[]> {
    let target = address;
    if (mint) {
      target = getATAAddressSync({
        mint: new PublicKey(mint),
        owner: new PublicKey(address),
      }).toBase58();
    }

    return this.get(`/v0/addresses/${target}/transactions`, {
      params: {
        "api-key": this.#apiKey,
        commitment: "confirmed",
        before,
        until,
      },
    });
  }
}

/**
 * Custom GraphQL REST data source class abstraction for Helius RPC.
 * @export
 * @class HeliusRpc
 * @extends {RESTDataSource}
 */
export class HeliusRpc extends RESTDataSource {
  readonly #apiKey: string;

  override baseURL = "https://rpc.helius.xyz";

  constructor(opts: HeliusOptions) {
    super();
    this.#apiKey = opts.apiKey;
    if (opts.devnet) {
      this.baseURL = "https://rpc-devnet.helius.xyz";
    }
  }

  /**
   * Get the NFTs for a specific owner using the DAS API.
   * @param {string} address
   * @returns {Promise<HeliusGetAssetsByOwnerResponse>}
   * @memberof HeliusRpc
   */
  async getAssetsByOwner(
    address: string
  ): Promise<HeliusGetAssetsByOwnerResponse> {
    return this.post("/", {
      params: {
        "api-key": this.#apiKey,
      },
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "1",
        method: "getAssetsByOwner",
        params: {
          ownerAddress: address,
          page: 1,
          limit: 200,
        },
      }),
    });
  }
}

////////////////////////////////////////////
//                Types                   //
////////////////////////////////////////////

export type HeliusGetBalancesResponse = {
  nativeBalance: number;
  tokens: Array<{
    amount: number;
    decimals: number;
    mint: string;
    tokenAccount: string;
  }>;
};

export type HeliusGetTokenMetadataResponse = Array<{
  account: string;
  onChainAccountInfo: {
    accountInfo: AccountInfo<{
      parsed: {
        info: {
          decimals: number;
          freezeAuthority: string;
          isInitialized: string;
          mintAuthority: string;
          supply: string;
        };
        type: string;
      };
      program: string;
      space: number;
    }>;
    error: string;
  };
  onChainMetadata?: {
    error?: string;
    metadata: {
      tokenStandard: string;
      key: string;
      updateAuthority: string;
      mint: string;
      data: {
        name: string;
        symbol?: string;
        uri: string;
        sellerFeeBasisPoints?: number;
        creators: Array<{ address: string; share: number; verified: boolean }>;
      };
      primarySaleHappened: boolean;
      isMutable: boolean;
      editionNonce?: number;
      uses?: {
        useMethod: string;
        remaining: number;
        total: number;
      };
      collection?: {
        key: string;
        verified: boolean;
      } | null;
      collectionDetails?: any;
    };
  };
  offChainMetadata?: {
    uri: string;
    error?: string;
    metadata: {
      name: string;
      description?: string;
      symbol?: string;
      image?: string;
      sellerFeeBasisPoints?: number;
      attributes?: Array<{ trait_type: string; value: string }>;
      properties?: any;
    };
  };
  legacyMetadata?: {
    chainId: number;
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    logoURI: string;
    tags: string[];
    extensions?: Partial<{
      coingeckoId: string;
      serumV3Usdt: string;
      website: string;
    }>;
  };
}>;

export type HeliusGetAssetsByOwnerResponse = {
  jsonrpc: string;
  result: {
    total: number;
    limit: number;
    page: number;
    items: Array<{
      id: string;
      interface: string;
      content: {
        $schema: string;
        json_uri: string;
        files: Array<{
          uri: string;
          cdn_uri?: string;
          mime: string;
        }>;
        metadata: {
          attributes: Array<{
            trait_type: string;
            value: string;
          }>;
          description: string;
          name: string;
          symbol: string;
        };
        links: {
          external_url?: string | null;
        };
      };
      authorities: Array<{
        address: string;
        scopes: string[];
      }>;
      compression: {
        eligible: boolean;
        compressed: boolean;
        data_hash?: string | null;
        creator_hash?: string | null;
        asset_hash?: string | null;
        tree?: string | null;
        seq: number;
        leaf_id: number;
      };
      grouping: Array<{
        group_key: string;
        group_value: string;
      }>;
      royalty: {
        royalty_model: string;
        target?: any | null;
        percent: number;
        basis_points: number;
        primary_sale_happened: boolean;
        lcoked: boolean;
      };
      creators: Array<{
        address: string;
        share: number;
        verified: boolean;
      }>;
      ownership: {
        frozen: boolean;
        delegated: boolean;
        delegate?: string | null;
        ownership_module: string;
        owner: string;
      };
      supply?: any | null;
      mutable: boolean;
    }>;
  };
};
