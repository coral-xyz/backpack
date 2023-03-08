import { metadata } from "@project-serum/token";
import { PublicKey } from "@solana/web3.js";

import { externalResourceUri } from "./externalResourceUri";

const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);
export async function solanaNftMetadata(
  mintAddress: string,
  c: any
): Promise<{ metadataAccount: any; externalMetadata: any } | null> {
  const metadataAccountAddress = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      new PublicKey(mintAddress).toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  )[0];

  const metadataAccountResponse = await c.env.solanaRpc.fetch(
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
          "${metadataAccountAddress}",
          {
            "encoding": "base64"
          }
        ]
      }`,
    })
  );

  const metadataAccount = await metadataAccountResponse.json();

  const data = metadataAccount?.result?.value?.data?.[0];
  if (!metadataAccount || !data) {
    return null;
  }

  const parsedMetadata = metadata.decodeMetadata(Buffer.from(data, "base64"));

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
