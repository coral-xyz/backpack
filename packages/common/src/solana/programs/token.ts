import { PublicKey } from "@solana/web3.js";
import type { Connection } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import { AnchorProvider, BN, Spl } from "@project-serum/anchor";
import type { Provider, Program, SplToken } from "@project-serum/anchor";
import { metadata } from "@project-serum/token";
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
  // Fetch metadata.
  //
  const tokenMetadata = await fetchSplMetadata(
    tokenClient.provider,
    tokenAccountsArray
  );

  //
  // Fetch the metadata uri and interpert as NFTs.
  //
  const nftMetadata = await fetchSplMetadataUri(
    tokenAccountsArray,
    tokenMetadata
  );

  const tokenAccountsMap = (
    Array.from(removeNfts(tokenAccounts, nftMetadata)).map(
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
    tokenMetadata,
    nftMetadata: Array.from(nftMetadata),
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
          account: metadata.decodeMetadata(t.account.data),
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
