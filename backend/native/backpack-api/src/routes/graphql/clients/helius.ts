import type { AccountInfo } from "@solana/web3.js";

export class Helius {
  static readonly #apiBase: string = "https://api.helius.xyz";
  readonly #apiKey: string;

  constructor(apiKey: string) {
    this.#apiKey = apiKey;
  }

  /**
   * Get the raw native and token balance data for the argued wallet address.
   * @param {string} address
   * @returns {Promise<HeliusGetBalancesResponse>}
   * @memberof Helius
   */
  async getBalances(address: string): Promise<HeliusGetBalancesResponse> {
    const resp = await fetch(
      this._endpoint(`/v0/addresses/${address}/balances`)
    );
    return resp.json();
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
    const resp = await fetch(this._endpoint("/v0/token-metadata"), {
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
   * @param {string[]} mints
   * @param {boolean} [includeOffChain]
   * @returns {Promise<HeliusGetTokenMetadataResponse>}
   * @memberof Helius
   */
  async getTokenMetadata(
    mints: string[],
    includeOffChain?: boolean
  ): Promise<HeliusGetTokenMetadataResponse> {
    const resp = await fetch(this._endpoint("/v0/token-metadata"), {
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

  /**
   * Build the API route endpoint based on the argued subpath.
   * @param {string} route
   * @returns {string}
   * @memberof Helius
   */
  private _endpoint(route: string): string {
    return `${Helius.#apiBase}/${route.replace(/^\//g, "")}?api-key=${
      this.#apiKey
    }`;
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
