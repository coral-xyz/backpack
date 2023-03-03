import {
  Metadata,
  TokenStandard,
} from "@metaplex-foundation/mpl-token-metadata";
import type { Program, Provider, SplToken } from "@project-serum/anchor";
import * as anchor from "@project-serum/anchor";
import { AnchorProvider, BN, Spl } from "@project-serum/anchor";
import type { RawMint } from "@solana/spl-token";
import { MintLayout } from "@solana/spl-token";
import type { Connection } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";

import { getLogger } from "../../logging";
import { externalResourceUri } from "../../utils";
import type {
  ReplaceTypes,
  SolanaTokenAccount,
  SolanaTokenAccountWithKey,
  SolanaTokenAccountWithKeyString,
  SplNftMetadataString,
  TokenMetadata,
  TokenMetadataString,
} from "../types";

export const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);
export const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
);
export const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);
export const TOKEN_AUTH_RULES_ID = new PublicKey(
  "auth9SigNpDKz4sJJ1DfCTuZrZNSAgh9sFD3rboVmgg"
);
export const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
export const WSOL_MINT = "So11111111111111111111111111111111111111112";
//
// App's dummy representation of native sol as an SPL token. This is *not*
// wrapped SOL. We treat native sol in the same way as we do SPL tokens.
//
export const SOL_NATIVE_MINT = PublicKey.default.toString();

const logger = getLogger("common/solana/programs/token");

export function associatedTokenAddress(
  mint: PublicKey,
  wallet: PublicKey
): PublicKey {
  return anchor.utils.publicKey.findProgramAddressSync(
    [wallet.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  )[0];
}

export async function customSplTokenAccounts(
  connection: Connection,
  publicKey: PublicKey
): Promise<CustomSplTokenAccountsResponse> {
  // @ts-ignore
  const provider = new AnchorProvider(connection, { publicKey });
  const tokenClient = Spl.token(provider);

  //
  // Fetch all tokenAccounts.
  //
  const [accountInfo, tokenAccounts] = await Promise.all([
    //
    // Fetch native sol data.
    //
    provider.connection.getAccountInfo(publicKey),
    //
    // Fetch tokens.
    //
    fetchTokens(publicKey, tokenClient),
  ]);
  const tokenAccountsArray = Array.from(tokenAccounts.values());

  //
  // Fetch all mints.
  //
  const [mintsMap, tokenMetadata] = await Promise.all([
    fetchMints(provider, tokenAccountsArray).then((mint) =>
      mint.filter((m) => m[1] !== null)
    ),
    fetchSplMetadata(tokenClient.provider, tokenAccountsArray),
  ]);

  //
  // Separate out fungible and non-fungible tokens.
  //
  const { fungibleTokens, fungibleTokenMetadata, nftTokens, nftTokenMetadata } =
    splitOutNfts(
      tokenAccountsArray,
      tokenMetadata,
      new Map(mintsMap) as Map<string, RawMint>
    );

  //
  // Add native SOL to the token and metadata list.
  //
  const nativeSol: SolanaTokenAccountWithKey = {
    key: publicKey,
    mint: PublicKey.default,
    authority: publicKey,
    amount: accountInfo ? new BN(accountInfo.lamports) : new BN(0),
    delegate: null,
    state: 1,
    isNative: null,
    delegatedAmount: new BN(0),
    closeAuthority: null,
  };
  const nativeSolMetadata = null;

  return {
    mintsMap,
    nfts: {
      nftTokens,
      nftTokenMetadata,
    },
    fts: {
      fungibleTokens: fungibleTokens.concat([nativeSol]),
      fungibleTokenMetadata: fungibleTokenMetadata.concat([nativeSolMetadata]),
    },
  };
}

export type CustomSplTokenAccountsResponse = {
  mintsMap: Array<[string, RawMint | null]>;
  nfts: {
    nftTokens: Array<SolanaTokenAccountWithKey>;
    nftTokenMetadata: Array<TokenMetadata | null>;
  };
  fts: {
    fungibleTokens: Array<SolanaTokenAccountWithKey>;
    fungibleTokenMetadata: Array<TokenMetadata | null>;
  };
};

export type CustomSplTokenAccountsResponseString = ReplaceTypes<
  CustomSplTokenAccountsResponse,
  PublicKey,
  string
>;

export async function fetchMints(
  provider: Provider,
  tokenAccounts: SolanaTokenAccountWithKey[]
): Promise<Array<[string, RawMint | null]>> {
  const mints: [string, RawMint | null][] = (
    await anchor.utils.rpc.getMultipleAccounts(
      provider.connection,
      tokenAccounts.map((t) => t.mint)
    )
  ).map((m, idx) => {
    return [
      tokenAccounts[idx].mint.toString(),
      m ? MintLayout.decode(m.account.data) : null,
    ];
  });
  return mints;
}

export async function fetchSplMetadata(
  provider: Provider,
  tokens: SolanaTokenAccountWithKey[]
): Promise<(TokenMetadata | null)[]> {
  //
  // Fetch metadata for each token.
  //
  const metaAddrs = await Promise.all(
    tokens.map(async (t) => {
      return {
        token: t,
        publicKey: t.key,
        metadataAddress: await metadataAddress(t.mint),
      };
    })
  );
  const tokenMetaAccounts = (
    await anchor.utils.rpc.getMultipleAccounts(
      provider.connection,
      metaAddrs.map((t) => t.metadataAddress)
    )
  ).map((t) =>
    t
      ? {
          publicKey: t.publicKey,
          account: Metadata.deserialize(t.account.data)[0],
        }
      : null
  );

  return tokenMetaAccounts;
}

/**
 * Splits out all the tokens into fungible and non fungible tokens.
 */
function splitOutNfts(
  tokens: Array<SolanaTokenAccountWithKey>,
  tokensMetadata: Array<TokenMetadata | null>,
  mintsMap: Map<string, RawMint>
): {
  nftTokens: Array<SolanaTokenAccountWithKey>;
  nftTokenMetadata: Array<TokenMetadata | null>;
  fungibleTokens: Array<SolanaTokenAccountWithKey>;
  fungibleTokenMetadata: Array<TokenMetadata | null>;
} {
  let nftTokens: Array<SolanaTokenAccountWithKey> = [];
  let nftTokenMetadata: Array<TokenMetadata | null> = [];

  let fungibleTokens: Array<SolanaTokenAccountWithKey> = [];
  let fungibleTokenMetadata: Array<TokenMetadata | null> = [];

  tokens.forEach((token, idx) => {
    const tokenMetadata = tokensMetadata[idx];

    //
    // If token standard is available use it.
    //
    if (
      tokenMetadata &&
      tokenMetadata.account &&
      !!tokenMetadata.account.tokenStandard
    ) {
      if (tokenMetadata.account.tokenStandard === TokenStandard.Fungible) {
        fungibleTokens.push(token);
        fungibleTokenMetadata.push(tokenMetadata);
      } else {
        nftTokens.push(token);
        nftTokenMetadata.push(tokenMetadata);
      }
    }
    //
    // Token standard not available so use decimals to determin if it's an NFT.
    //
    else {
      const mint = mintsMap.get(token.mint.toString());
      if (mint && mint.decimals === 0) {
        nftTokens.push(token);
        nftTokenMetadata.push(tokenMetadata);
      } else {
        fungibleTokens.push(token);
        fungibleTokenMetadata.push(tokenMetadata);
      }
    }
  });

  return {
    nftTokens,
    nftTokenMetadata,
    fungibleTokens,
    fungibleTokenMetadata,
  };
}

export async function fetchSplMetadataUri(
  tokens: Array<SolanaTokenAccountWithKeyString>,
  tokenMetadata: Array<TokenMetadataString | null>
): Promise<Array<[string, SplNftMetadataString]>> {
  // Fetch the URI for each token.
  const tokenMetaUriData = await Promise.all(
    tokenMetadata.map(async (t) => {
      if (t === null || !t.account.data.uri) {
        return null;
      }
      try {
        const resp = await new Promise<any>(async (resolve, reject) => {
          setTimeout(() => {
            reject(new Error("timeout"));
          }, 6000);
          const uri = t.account.data.uri;
          try {
            const resp = await fetch(
              `${externalResourceUri(uri, { cached: true })}`
            );
            resolve(await resp.json());
          } catch (err) {
            try {
              const resp = await fetch(externalResourceUri(uri));
              resolve(await resp.json());
            } catch (e) {
              reject(err);
            }
          }
        });
        return resp;
      } catch (err) {
        logger.debug(
          `error fetching token metadata: ${t.account.data.uri}`,
          err
        );
      }
    })
  );

  //
  // Zip it all together.
  //
  const splMetadata = tokens.reduce((acc, m, idx) => {
    const metadata = tokenMetadata[idx];
    if (!metadata || !tokenMetaUriData[idx]) {
      return acc;
    }
    acc.push([
      m.key.toString(),
      {
        publicKey: m.key,
        metadataAddress: metadata.publicKey,
        metadata: metadata.account,
        tokenMetaUriData: tokenMetaUriData[idx],
      },
    ]);
    return acc;
  }, [] as Array<[string, SplNftMetadataString]>);

  return splMetadata;
}

export async function metadataAddress(mint: PublicKey): Promise<PublicKey> {
  return (
    await PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    )
  )[0];
}

export async function masterEditionAddress(
  mint: PublicKey
): Promise<PublicKey> {
  return (
    await PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
        Buffer.from("edition"),
      ],
      TOKEN_METADATA_PROGRAM_ID
    )
  )[0];
}

export async function tokenRecordAddress(
  mint: PublicKey,
  token: PublicKey
): Promise<PublicKey> {
  return (
    await PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
        Buffer.from("token_record"),
        token.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    )
  )[0];
}

export async function fetchTokens(
  walletPublicKey: PublicKey,
  tokenClient: Program<SplToken>
): Promise<Map<string, SolanaTokenAccountWithKey>> {
  //
  // Fetch the accounts.
  //
  const resp = await tokenClient.provider.connection.getTokenAccountsByOwner(
    walletPublicKey,
    {
      programId: tokenClient.programId,
    }
  );
  //
  // Decode the data.
  //
  const tokens: Array<[string, SolanaTokenAccountWithKey]> = resp.value.map(
    ({ account, pubkey }: any) => [
      pubkey.toString(),
      {
        ...(tokenClient.coder.accounts.decode(
          "token",
          account.data
        ) as SolanaTokenAccount),
        key: pubkey,
      },
    ]
  );
  //
  // Filter out any invalid tokens.
  //
  const validTokens = tokens.filter(([, t]) => t.amount.gt(new BN(0)));
  //
  // Done.
  //
  return new Map(validTokens);
}
