// needed to avoid TS error TS2742, see: https://bit.ly/3ymWOFj
import type { BackgroundClient } from "@coral-xyz/common";
import {
  IS_MOBILE,
  SOLANA_CONNECTION_RPC_CUSTOM_SPL_METADATA_URI,
  SOLANA_CONNECTION_RPC_CUSTOM_SPL_TOKEN_ACCOUNTS,
} from "@coral-xyz/common";
import type {} from "@metaplex-foundation/beet";
import type {
  AccountInfo,
  Commitment,
  ConnectionConfig,
} from "@solana/web3.js";
import { Connection, PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { decode as bs58Decode, encode as bs58Encode } from "bs58";
import { Buffer } from "buffer";

import type {
  CustomSplTokenAccountsResponse,
  CustomSplTokenAccountsResponseString,
} from "./programs/token";
import type {
  SolanaTokenAccountWithKeyAndProgramId,
  SolanaTokenAccountWithKeyAndProgramIdString,
  SplNftMetadataString,
  TokenMetadata,
  TokenMetadataString,
} from "./types";

export class BackgroundSolanaConnection extends Connection {
  private _backgroundClient: BackgroundClient;

  // Note that this constructor is actually meaningless.
  // We only use it so that we can subclass Connection.
  // In reality, the params here are actually read in the context of the
  // background script.
  constructor(
    backgroundClient: BackgroundClient,
    endpoint: string,
    commitmentOrConfig?: Commitment | ConnectionConfig
  ) {
    super(endpoint, commitmentOrConfig);
    this._backgroundClient = backgroundClient;
  }

  async customSplMetadataUri(
    tokens: Array<SolanaTokenAccountWithKeyAndProgramIdString>,
    tokenMetadata: Array<TokenMetadataString | null>
  ): Promise<Array<[string, SplNftMetadataString]>> {
    // ph101pp todo
    return await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_CUSTOM_SPL_METADATA_URI,
      params: [tokens, tokenMetadata],
    });
  }

  async customSplTokenAccounts(
    publicKey: PublicKey
  ): Promise<CustomSplTokenAccountsResponseString> {
    // ph101pp todo
    const resp = await this._backgroundClient.request({
      method: SOLANA_CONNECTION_RPC_CUSTOM_SPL_TOKEN_ACCOUNTS,
      params: [publicKey.toString()],
    });
    return BackgroundSolanaConnection.customSplTokenAccountsFromJson(resp);
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
  ) /* : CustomSplTokenAccountsResponseString */ {
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
          return BackgroundSolanaConnection.solanaTokenAccountWithKeyToJson(t);
        }),
        fungibleTokenMetadata: _resp.fts.fungibleTokenMetadata.map((t) => {
          return t ? BackgroundSolanaConnection.tokenMetadataToJson(t) : null;
        }),
      },
      nfts: {
        nftTokens: _resp.nfts.nftTokens.map((t) => {
          return BackgroundSolanaConnection.solanaTokenAccountWithKeyToJson(t);
        }),
        nftTokenMetadata: _resp.nfts.nftTokenMetadata.map((t) => {
          return t ? BackgroundSolanaConnection.tokenMetadataToJson(t) : null;
        }),
      },
    };
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

  static accountInfoToJson(res: AccountInfo<Buffer> | null) {
    if (!IS_MOBILE) {
      return res;
    }

    if (res == null) {
      return res;
    }

    return {
      ...res,
      owner: res.owner.toString(),
      data: res.data ? bs58Encode(res.data) : res.data,
    };
  }

  static accountInfoFromJson(res: AccountInfo<any>) {
    if (!IS_MOBILE) {
      res.data = Buffer.from(res.data);
      res.owner = new PublicKey(res.owner);
      return res;
    }

    return {
      ...res,
      owner: new PublicKey(res.owner),
      data: bs58Decode(res.data),
    };
  }
}
