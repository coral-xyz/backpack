import { RESTDataSource } from "@apollo/datasource-rest";
import type { AccountInfo } from "@solana/web3.js";
import type { EnrichedTransaction } from "helius-sdk";

export class Helius extends RESTDataSource {
  readonly #apiKey: string;

  override baseURL = "https://api.helius.xyz";

  constructor(apiKey: string) {
    super();
    this.#apiKey = apiKey;
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
   * Fetch and create a mapping between token mint address and discoverable
   * CoinGecko token ID and logo URIs through the legacy token metadata extensions.
   * @param {string[]} mints
   * @returns {Promise<Map<string, { id: string, logo: string }>>}
   * @memberof Helius
   */
  async getLegacyMetadata(
    mints: string[]
  ): Promise<Map<string, { id: string; logo: string }>> {
    const resp = await this.post<HeliusGetTokenMetadataResponse>(
      "/v0/token-metadata",
      {
        headers: { "Content-Type": "application/json" },
        params: {
          "api-key": this.#apiKey,
        },
        body: JSON.stringify({
          mintAccounts: mints,
          includeOffChain: false,
          disableCache: false,
        }),
      }
    );

    const mappings: Map<string, { id: string; logo: string }> = new Map();

    for (const entry of resp) {
      const id = entry.legacyMetadata?.extensions?.coingeckoId ?? null;
      if (id && entry.legacyMetadata?.logoURI) {
        mappings.set(entry.account, {
          id,
          logo: entry.legacyMetadata.logoURI,
        });
      }
    }

    return mappings;
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
   * @returns {Promise<EnrichedTransaction[]>}
   * @memberof Helius
   */
  async getTransactionHistory(
    address: string,
    before?: string,
    until?: string
  ): Promise<EnrichedTransaction[]> {
    return this.get(`/v0/addresses/${address}/transactions`, {
      params: {
        "api-key": this.#apiKey,
        commitment: "confirmed",
        before,
        until,
      },
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
