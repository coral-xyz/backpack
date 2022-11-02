import { PublicKey } from "@solana/web3.js";
import type { Connection } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import { AnchorProvider, BN, Spl } from "@project-serum/anchor";
import type { Provider, Program, SplToken } from "@project-serum/anchor";
import {
  Metadata,
  TokenStandard,
} from "@metaplex-foundation/mpl-token-metadata";
import { MintLayout } from "@solana/spl-token";
import { externalResourceUri } from "@coral-xyz/common-public";
import type {
  SolanaTokenAccount,
  SolanaTokenAccountWithKey,
  SolanaTokenAccountWithKeySerializable,
  SplNftMetadata,
  TokenMetadata,
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
export const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
export const WSOL_MINT = "So11111111111111111111111111111111111111112";
//
// App's dummy representation of native sol as an SPL token. This is *not*
// wrapped SOL. We treat native sol in the same way as we do SPL tokens.
//
export const SOL_NATIVE_MINT = PublicKey.default.toString();

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
): Promise<{
  tokenAccountsMap: [string, SolanaTokenAccountWithKeySerializable][];
  tokenMetadata: (TokenMetadata | null)[];
  nftMetadata: [string, SplNftMetadata][];
}> {
  // @ts-ignore
  const provider = new AnchorProvider(connection, { publicKey });
  const tokenClient = Spl.token(provider);

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
  const nativeSol: SolanaTokenAccountWithKeySerializable = {
    key: publicKey,
    mint: PublicKey.default,
    authority: publicKey,
    amount: accountInfo ? accountInfo.lamports.toString() : "0",
    delegate: null,
    state: 1,
    isNative: null,
    delegatedAmount: new BN(0),
    closeAuthority: null,
  };
  const tokenAccountsArray = Array.from(tokenAccounts.values());
  //
  // Fetch onchain metadata.
  //
  const tokenMetadataArray = await fetchSplMetadata(
    tokenClient.provider,
    tokenAccountsArray
  );

  //
  // Fetch all metadata uris
  //
  const tokenAccountsToMetadataWithUri = await fetchSplMetadataUri(
    tokenAccountsArray,
    tokenMetadataArray
  );

  //
  // Separate into NFTs and fungible tokens
  //
  const {
    splTokenMetadata: tokensWithUriMetadata,
    splNftMetadata: nftsWithUriMetadata,
  } = await separateNfts(tokenClient.provider, tokenAccountsToMetadataWithUri);

  //
  // Construct list of all fungible tokens
  //
  const allTokens = await zipFungibleTokens(
    tokenMetadataArray,
    tokensWithUriMetadata
  );

  const tokenAccountsMap = (
    Array.from(removeNfts(tokenAccounts, nftsWithUriMetadata)).map(
      ([key, SolanaTokenAccountWithKey]) => [
        key,
        {
          ...SolanaTokenAccountWithKey,
          amount: SolanaTokenAccountWithKey.amount.toString(),
        },
      ]
    ) as [string, SolanaTokenAccountWithKeySerializable][]
  ).concat([[nativeSol.key.toString(), nativeSol]]);

  return {
    tokenAccountsMap,
    tokenMetadata: allTokens,
    nftMetadata: Array.from(nftsWithUriMetadata),
  };
}

export async function zipFungibleTokens(
  tokenAccountsMetadata: (TokenMetadata | null)[],
  tokensWithMetadataUri: Map<string, SplNftMetadata & { decimals: number }>
) {
  const map = tokenAccountsMetadata.reduce((acc, m, idx) => {
    if (!m) return acc;
    acc.set(m.publicKey.toString(), m);
    return acc;
  }, new Map<string, TokenMetadata>());

  for (const [key, value] of tokensWithMetadataUri) {
    const old = map.get(value.metadataAddress.toString());
    if (!old) continue;
    map.set(value.metadataAddress.toString(), {
      ...old,
      uriMetadata: value.tokenMetaUriData,
      decimals: value.decimals,
    });
  }
  return Array.from(map.values());
}

export async function separateNfts(
  provider: Provider,
  tokens: Map<string, SplNftMetadata>
) {
  //
  // Fetch mints for each token
  //
  const metadataArr = Array.from(tokens.values());
  const mints = (
    await anchor.utils.rpc.getMultipleAccounts(
      provider.connection,
      metadataArr.map((t) => t.metadata.mint)
    )
  ).map((m) => {
    return m ? MintLayout.decode(m.account.data) : null;
  });

  // if token standard is available then use it. otherwise determine fungibility by decimals
  const tokensWithMetadata = metadataArr
    .map((m, idx) => {
      return { ...m, decimals: mints[idx]?.decimals || 0 };
    })
    .filter((m, idx) =>
      m.metadata.tokenStandard
        ? m.metadata.tokenStandard == TokenStandard.FungibleAsset ||
          m.metadata.tokenStandard == TokenStandard.Fungible
        : (mints[idx]?.decimals || 0) > 0
    )
    .filter(Boolean);
  const nftsWithMetadata = metadataArr.filter((m, idx) =>
    m.metadata.tokenStandard
      ? m.metadata.tokenStandard == TokenStandard.NonFungibleEdition ||
        (m.metadata.tokenStandard as TokenStandard) == TokenStandard.NonFungible
      : (mints[idx]?.decimals || 0) == 0
  );

  const splTokenMetadata = tokensWithMetadata.reduce((acc, m) => {
    acc.set(m.publicKey.toString(), m);
    return acc;
  }, new Map<string, SplNftMetadata & { decimals: number }>());
  const splNftMetadata = nftsWithMetadata.reduce((acc, m) => {
    acc.set(m.publicKey.toString(), m);
    return acc;
  }, new Map<string, SplNftMetadata>());

  return {
    splTokenMetadata,
    splNftMetadata,
  };
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

export async function fetchSplMetadataUri(
  tokens: SolanaTokenAccountWithKey[],
  splTokenMetadata: (TokenMetadata | null)[]
): Promise<Map<string, SplNftMetadata>> {
  //
  // Fetch the URI for each metadata.
  //
  const tokenMetaUriData = await Promise.all(
    splTokenMetadata.map(async (t) => {
      if (t === null || !t.account.data.uri) {
        return null;
      }
      try {
        // @ts-ignore
        const resp = await new Promise<any>(async (resolve, reject) => {
          setTimeout(() => {
            reject(new Error("timeout"));
          }, 5000);
          try {
            const resp = await fetch(externalResourceUri(t.account.data.uri));
            resolve(resp);
          } catch (err) {
            reject(err);
          }
        });
        return await resp.json();
      } catch (err) {
        console.log(`error fetching: ${t.account.data.uri}`, err);
      }
    })
  );

  //
  // Zip it all together.
  //
  const splNftMetadata = tokens.reduce((acc, m, idx) => {
    const tokenMetadata = splTokenMetadata[idx];
    if (!tokenMetadata) {
      return acc;
    }
    if (!tokenMetaUriData[idx]) {
      return acc;
    }
    acc.set(m.key.toString(), {
      publicKey: m.key,
      metadataAddress: tokenMetadata.publicKey,
      metadata: tokenMetadata.account,
      tokenMetaUriData: tokenMetaUriData[idx],
    });
    return acc;
  }, new Map<string, SplNftMetadata>());

  //
  // Done.
  //
  return splNftMetadata;
}

async function metadataAddress(mint: PublicKey): Promise<PublicKey> {
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

function removeNfts(
  splTokenAccounts: Map<string, SolanaTokenAccountWithKey>,
  splNftMetadata: Map<string, SplNftMetadata>
): Map<string, SolanaTokenAccountWithKey> {
  for (let key of splNftMetadata.keys()) {
    splTokenAccounts.delete(key);
  }
  return splTokenAccounts;
}
