import type { AccountInfo } from "@solana/web3.js";

const API_BASE = "https://api.helius.xyz";

/**
 * Build the API route endpoint based on the argued subpath.
 * @param {string} route
 * @returns {string}
 */
const _endpoint = (route: string): string =>
  `${API_BASE}/${route.replace(/^\//g, "")}?api-key=${
    process.env.HELIUS_API_KEY ?? ""
  }`;

export abstract class Helius {
  /**
   * Get the raw native and token balance data for the argued wallet address.
   * @static
   * @param {string} address
   * @returns {Promise<HeliusGetBalancesResponse>}
   * @memberof Helius
   */
  static async getBalances(
    address: string
  ): Promise<HeliusGetBalancesResponse> {
    const resp = await fetch(_endpoint(`/v0/addresses/${address}/balances`));
    return resp.json();
  }

  /**
   * Fetch and create a mapping between token mint address and discoverable
   * CoinGecko token ID and logo URIs through the legacy token metadata extensions.
   * @static
   * @param {string[]} mints
   * @returns {Promise<Map<string, { id: string, logo: string }>>}
   * @memberof Helius
   */
  static async getLegacyMetadata(
    mints: string[]
  ): Promise<Map<string, { id: string; logo: string }>> {
    const resp = await fetch(_endpoint("/v0/token-metadata"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mintAccounts: mints,
        includeOffChain: false,
        disableCache: false,
      }),
    });

    const json: HeliusGetTokenMetadataResponse = await resp.json();
    const mappings: Map<string, { id: string; logo: string }> = new Map();

    for (const entry of json) {
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
   * @static
   * @param {string[]} mints
   * @param {boolean} [includeOffChain]
   * @returns {Promise<HeliusGetTokenMetadataResponse>}
   * @memberof Helius
   */
  static async getTokenMetadata(
    mints: string[],
    includeOffChain?: boolean
  ): Promise<HeliusGetTokenMetadataResponse> {
    const resp = await fetch(_endpoint("/v0/token-metadata"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mintAccounts: mints,
        includeOffChain: includeOffChain ?? false,
        disableCache: false,
      }),
    });
    return resp.json();
  }
}

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
      };
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
