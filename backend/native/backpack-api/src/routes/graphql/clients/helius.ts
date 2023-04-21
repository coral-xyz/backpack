import type { AccountInfo } from "@solana/web3.js";

const API_BASE = "https://api.helius.xyz/v0";

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
    const resp = await fetch(_endpoint(`/addresses/${address}/balances`));
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
    const resp = await fetch(_endpoint("/token-metadata"), {
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
  onChainMetadata?: any; // FIXME:
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
