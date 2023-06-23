import { Metadata } from "@genesysgo/shadow-nft-generated-client";
import { metadata } from "@project-serum/token";
import { getMint } from "@solana/spl-token";
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

  const mintAccount = await getMint(c, new PublicKey(mintAddress));

  // Define metadata account addresses for all possible standards,
  // other standards can add their own :)
  const metadataAccountAddress = PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint],
    TOKEN_METADATA_PROGRAM_ID
  )[0];

  const shadowMetadataAccountAddress = PublicKey.findProgramAddressSync(
    [mint],
    SHADOW_NFT_PROGRAM_ID
  )[0];

  let metadataAccountResponse;
  switch (mintAccount?.mintAuthority?.toBase58()) {
    case metadataAccountAddress.toBase58():
      metadataAccountResponse = await fetchMetadataAccount(
        metadataAccountAddress,
        c
      );
      return metadataAccountResponse
        ? prepareResult(metadataAccountResponse, "metaplex")
        : null;

    case shadowMetadataAccountAddress.toBase58():
      metadataAccountResponse = await fetchMetadataAccount(
        shadowMetadataAccountAddress,
        c
      );
      return metadataAccountResponse
        ? prepareResult(metadataAccountResponse, "shadow")
        : null;

    default:
      return null;
  }
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

async function prepareResult(metadataAccountData: any, standard: string) {
  let jsonMetadata;
  let parsedMetadata;

  switch (standard) {
    case "shadow":
      parsedMetadata = Metadata.decode(
        Buffer.from(metadataAccountData, "base64")
      );

      if (!parsedMetadata?.uri) {
        return null;
      }

      const reconstructedUrl = reconstructUrlFromChainData(parsedMetadata.uri);
      jsonMetadata = await (
        await fetch(externalResourceUri(reconstructedUrl))
      ).json();
      break;
    case "metaplex":
      parsedMetadata = metadata.decodeMetadata(
        Buffer.from(metadataAccountData, "base64")
      );

      if (!parsedMetadata?.data?.uri) {
        return null;
      }

      jsonMetadata = await (
        await fetch(externalResourceUri(parsedMetadata.data.uri))
      ).json();
      break;
    default:
      null;
  }

  return {
    metadataAccount: parsedMetadata,
    externalMetadata: jsonMetadata,
  };
}

function reconstructUrlFromChainData(url: any) {
  // Construct the domain part of the URL string based on the prefix kind
  let domain;
  switch (url.prefix.kind) {
    case "ShadowDrive":
      domain = `https://shdw-drive.genesysgo.net`;
      break;
    // Shadow Drive only supported for now
    default:
      throw new Error("Invalid prefix type");
  }

  const urlString = `${domain}/${url.prefix.value.account.toString()}/${
    url.object
  }`;

  return urlString;
}
