import { metadata } from "@project-serum/token";
import { PublicKey } from "@solana/web3.js";

import { externalResourceUri } from "./externalResourceUri";

const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

const SHADOW_NFT_PROGRAM_ID = new PublicKey(
  "9fQse1hBRfzWweeUod6WEsR4jZf7hVucetEheCaWooY5"
);

export async function solanaNftMetadata(
  mintAddress: string,
  c: any
): Promise<{ metadataAccount: any; externalMetadata: any } | null> {
  const mint = new PublicKey(mintAddress).toBuffer();

  // Define metadata account addresses for both types
  const metadataAccountAddress = PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint],
    TOKEN_METADATA_PROGRAM_ID
  )[0];

  const shadowMetadataAccountAddress = PublicKey.findProgramAddressSync(
    [mint],
    SHADOW_NFT_PROGRAM_ID
  )[0];

  // Send both requests in parallel
  // Honestly didn't see a way around fetching both. Checking mint account owner would also add addl calls.
  const [metadataAccountResponse, shadowMetadataAccountResponse] =
    await Promise.all([
      fetchMetadataAccount(metadataAccountAddress, c),
      fetchMetadataAccount(shadowMetadataAccountAddress, c),
    ]);

  // Check the responses to decide which one to use
  if (metadataAccountResponse) {
    return prepareResult(metadataAccountResponse, false);
  } else if (shadowMetadataAccountResponse) {
    return prepareResult(shadowMetadataAccountResponse, true);
  }

  return null;
}

async function fetchMetadataAccount(accountAddress: PublicKey, c: any) {
  const response = await c.env.solanaRpc.fetch(
    new Request("https://rpc-proxy.backpack.workers.dev/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: `{
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getAccountInfo",
        "params": [
          "${accountAddress}",
          {
            "encoding": "base64"
          }
        ]
      }`,
    })
  );

  const account = await response.json();
  const data = account?.result?.value?.data?.[0];

  return data ?? null;
}

async function prepareResult(metadataAccountData: any, isShadow: boolean) {
  const parsedMetadata = isShadow
    ? ""
    : metadata.decodeMetadata(Buffer.from(metadataAccountData, "base64"));

  if (!parsedMetadata?.data?.uri) {
    return null;
  }

  const jsonMetadata = await (
    await fetch(externalResourceUri(parsedMetadata.data.uri))
  ).json();

  return {
    metadataAccount: parsedMetadata,
    externalMetadata: jsonMetadata,
  };
}
