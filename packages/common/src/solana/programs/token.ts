import { PublicKey } from "@solana/web3.js";
import type { Connection } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import { Provider, Spl } from "@project-serum/anchor";
import type { Program, SplToken } from "@project-serum/anchor";
import { metadata } from "@project-serum/token";

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
): Promise<any> {
  // @ts-ignore
  const provider = new Provider(connection);

  // Unhooked connection.
  const tokenClient = Spl.token(provider);
  //
  // Fetch tokens.
  //
  const tokenAccounts = await fetchTokens(publicKey, tokenClient);
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

  return {
    tokenAccountsMap: Array.from(removeNfts(tokenAccounts, nftMetadata)).map(
      (t) => {
        // Convert BN to string for response.
        // @ts-ignore
        t[1].amount = t[1].amount.toString();
        return t;
      }
    ),
    tokenMetadata,
    nftMetadata: Array.from(nftMetadata),
  };
}

export async function fetchSplMetadata(
  provider: Provider,
  tokens: Array<any>
): Promise<Array<null | { publicKey: PublicKey; account: any }>> {
  //
  // Fetch metadata for each token.
  //
  const metaAddrs = await Promise.all(
    tokens.map(async (t: any) => {
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
      metaAddrs.map((t: any) => t.metadataAddress)
    )
  ).map((t) =>
    t
      ? {
          publicKey: t!.publicKey,
          account: metadata.decodeMetadata(t!.account.data),
        }
      : null
  );

  return tokenMetaAccounts;
}

export async function fetchSplMetadataUri(
  tokens: Array<any>,
  splTokenMetadata: Array<any>
): Promise<Map<string, any>> {
  //
  // Fetch the URI for each metadata.
  //
  const tokenMetaUriData = await Promise.all(
    splTokenMetadata
      // @ts-ignore
      .map(async (t) => {
        if (t === null || t === undefined || !t.account.data.uri) {
          return null;
        }
        try {
          // @ts-ignore
          const resp = await fetch(t.account.data.uri);
          return resp.json();
        } catch (err) {
          console.log(err);
        }
      })
  );

  //
  // Zip it all together.
  //
  const splNftMetadata: Map<string, any> = new Map(
    // @ts-ignore
    tokens
      // @ts-ignore
      .map((m, idx) => {
        const tokenMetadata = splTokenMetadata[idx];
        if (!tokenMetadata) {
          return null;
        }
        if (!tokenMetaUriData[idx]) {
          return null;
        }
        return [
          m.key.toString(),
          {
            publicKey: m.key,
            metadataAddress: tokenMetadata.publicKey,
            metadata: tokenMetadata.account,
            tokenMetaUriData: tokenMetaUriData[idx],
          },
        ];
      })
      // @ts-ignore
      .filter((m) => m !== null)
  );

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
): Promise<Map<string, any>> {
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
  const tokens: Array<[string, any]> = resp.value.map(
    ({ account, pubkey }: any) => [
      pubkey.toString(),
      {
        ...tokenClient.coder.accounts.decode("token", account.data),
        key: pubkey,
      },
    ]
  );
  //
  // Filter out any invalid tokens.
  //
  const validTokens = tokens.filter(([, t]) => t.amount.toNumber() >= 1);
  //
  // Done.
  //
  return new Map(validTokens);
}

function removeNfts(
  splTokenAccounts: Map<string, any>,
  splNftMetadata: Map<string, any>
): Map<string, any> {
  // @ts-ignore
  for (let key of splNftMetadata.keys()) {
    splTokenAccounts.delete(key);
  }
  return splTokenAccounts;
}
