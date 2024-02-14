import type { Commitment, ConnectionConfig, PublicKey } from "@solana/web3.js";
import { Connection } from "@solana/web3.js";
import BN from "bn.js";

import {
  customSplTokenAccounts,
  type CustomSplTokenAccountsResponse,
  type CustomSplTokenAccountsResponseString,
  fetchSplMetadataUri,
} from "./solanaLegacy/programs/token";
import type {
  SolanaTokenAccountWithKeyAndProgramId,
  SolanaTokenAccountWithKeyAndProgramIdString,
  SplNftMetadataString,
  TokenMetadata,
  TokenMetadataString,
} from "./solanaLegacy/types";

// Time until cached values expire. This is arbitrary.
const CACHE_EXPIRY = 15000;
const NFT_CACHE_EXPIRY = 15 * 60000;

export class BackpackSolanaConnection extends Connection {
  private cache = new Map<
    string,
    {
      ts: number;
      value: any;
    }
  >();
  constructor(
    endpoint: string,
    commitmentOrConfig?: Commitment | ConnectionConfig
  ) {
    super(endpoint, commitmentOrConfig);
  }

  async customSplTokenAccounts(
    publicKey: PublicKey
  ): Promise<CustomSplTokenAccountsResponseString> {
    const key = JSON.stringify({
      url: this.rpcEndpoint,
      method: "customSplTokenAccounts",
      args: [publicKey.toString()],
    });
    const value = this.cache.get(key);
    if (value && value.ts + CACHE_EXPIRY > Date.now()) {
      return value.value;
    }
    const resp = await customSplTokenAccounts(this, publicKey);

    this.cache.set(key, {
      ts: Date.now(),
      value: resp,
    });
    return BackpackSolanaConnection.customSplTokenAccountsFromJson(
      BackpackSolanaConnection.customSplTokenAccountsToJson(resp)
    );
  }

  async customSplMetadataUri(
    tokens: Array<SolanaTokenAccountWithKeyAndProgramIdString>,
    tokenMetadata: Array<TokenMetadataString | null>
  ): Promise<Array<[string, SplNftMetadataString]>> {
    const key = JSON.stringify({
      url: this.rpcEndpoint,
      method: "customSplMetadataUri",
      args: [tokens.map((t) => t.key).sort()],
    });
    const value = this.cache.get(key);
    if (value && value.ts + NFT_CACHE_EXPIRY > Date.now()) {
      return value.value;
    }
    const resp = await fetchSplMetadataUri(tokens, tokenMetadata);
    this.cache.set(key, {
      ts: Date.now(),
      value: resp,
    });
    return resp;
  }

  private intoCustomSplTokenAccountsKey(
    resp: CustomSplTokenAccountsResponse
  ): string {
    //
    // We sort the data so that we can have a consistent key when teh data
    // doesn't change. We remove the mints and metadata from the key because
    // it's not neceessary at all when calculating whether something has
    // changed.
    //
    return JSON.stringify({
      nfts: {
        nftTokens: resp.nfts.nftTokens
          .slice()
          .sort((a: any, b: any) =>
            a.key.toString().localeCompare(b.key.toString())
          ),
      },
      fts: {
        fungibleTokens: resp.fts.fungibleTokens
          .slice()
          .sort((a: any, b: any) =>
            a.key.toString().localeCompare(b.key.toString())
          ),
      },
    });
  }

  static customSplTokenAccountsFromJson(
    json: CustomSplTokenAccountsResponseString
  ): CustomSplTokenAccountsResponseString {
    return {
      mintsMap: json.mintsMap.map((m: any) => {
        return [
          m[0],
          {
            ...m[1],
            supply: BigInt(m[1].supply),
          },
        ];
      }),
      fts: {
        ...json.fts,
        fungibleTokens: json.fts.fungibleTokens.map((t: any) => {
          return {
            ...t,
            amount: new BN(t.amount),
          };
        }),
      },
      nfts: {
        ...json.nfts,
        nftTokens: json.nfts.nftTokens.map((t: any) => {
          return {
            ...t,
            amount: new BN(t.amount),
          };
        }),
      },
    };
  }

  static customSplTokenAccountsToJson(
    _resp: CustomSplTokenAccountsResponse
  ): CustomSplTokenAccountsResponseString {
    return {
      mintsMap: _resp.mintsMap.map(([publicKey, mintStr]) => {
        return [
          publicKey,
          mintStr !== null
            ? {
                ...mintStr,
                supply: mintStr.supply.toString(),
                mintAuthority: mintStr.mintAuthority?.toString(),
                freezeAuthority: mintStr.freezeAuthority?.toString(),
                programId: mintStr.programId?.toString(),
              }
            : null,
        ];
      }),
      fts: {
        fungibleTokens: _resp.fts.fungibleTokens.map((t) => {
          return BackpackSolanaConnection.solanaTokenAccountWithKeyToJson(t);
        }),
        // @ts-ignore
        fungibleTokenMetadata: _resp.fts.fungibleTokenMetadata.map((t) => {
          return t ? BackpackSolanaConnection.tokenMetadataToJson(t) : null;
        }),
      },
      nfts: {
        nftTokens: _resp.nfts.nftTokens.map((t) => {
          return BackpackSolanaConnection.solanaTokenAccountWithKeyToJson(t);
        }),
        // @ts-ignore
        nftTokenMetadata: _resp.nfts.nftTokenMetadata.map((t) => {
          return t ? BackpackSolanaConnection.tokenMetadataToJson(t) : null;
        }),
      },
    } as unknown as CustomSplTokenAccountsResponseString;
  }

  static solanaTokenAccountWithKeyToJson(
    t: SolanaTokenAccountWithKeyAndProgramId
  ) /* : SolanaTokenAccountWithKeyAndProgramIdString */ {
    return {
      ...t,
      mint: t.mint.toString(),
      key: t.key.toString(),
      programId: t.programId.toString(),
      amount: t.amount.toString(),
      delegate: t.delegate?.toString(),
      delegatedAmount: t.delegatedAmount.toString(),
      owner: t.owner.toString(),
      closeAuthority: t.closeAuthority?.toString(),
    };
  }

  static tokenMetadataToJson(t: TokenMetadata) /* : TokenMetadataString */ {
    return {
      ...t,
      publicKey: t.publicKey.toString(),
      account: {
        ...t.account,
        updateAuthority: t.account.updateAuthority.toString(),
        mint: t.account.mint.toString(),
        collection: t.account.collection
          ? {
              ...t.account.collection,
              key: t.account.collection.key.toString(),
            }
          : null,
        uses: t.account.uses
          ? {
              ...t.account.uses,
              remaining: t.account.uses.remaining.toString(),
              total: t.account.uses.total.toString(),
            }
          : null,
        data: {
          ...t.account.data,
          creators: (t.account.data.creators ?? []).map((c) => {
            return {
              ...c,
              address: c.address.toString(),
            };
          }),
        },
      },
    };
  }
}
