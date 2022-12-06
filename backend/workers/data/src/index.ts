import { metadata } from "@project-serum/token";
import { PublicKey } from "@solana/web3.js";
import { Hono } from "hono";

const app = new Hono();

const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

app.get("/metaplex-nft/:mintAddress/image", async (c) => {
  try {
    const { mintAddress } = c.req.param();

    const metadataAccountAddress = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        new PublicKey(mintAddress).toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    )[0];

    const metadataAccountResponse = await c.env.rpc.fetch(
      new Request("https://solana-rpc.xnfts.dev/rpc-proxy", {
        method: "POST",
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
      return c.status(404);
    }

    const parsedMetadata = metadata.decodeMetadata(Buffer.from(data, "base64"));

    if (!parsedMetadata?.data?.uri) {
      return c.status(404);
    }

    const jsonMetadata = await (
      await fetch(externalResourceUri(parsedMetadata.data.uri))
    ).json();

    // @ts-ignore
    const imageUrl = jsonMetadata?.image;

    if (!jsonMetadata || !imageUrl) {
      return c.status(404);
    }

    const imageResponse = await fetch(externalResourceUri(imageUrl));
    const response = new Response(imageResponse.body);
    response.headers.set(
      "Cache-Control",
      `max-age=${60 * 5}, s-maxage=${60 * 5}, stale-while-revalidate=${60 * 5}`
    );
    return response;
  } catch (e) {
    console.log("Error", e);
    return c.status(500);
  }
});

function externalResourceUri(uri: string): string {
  return uri
    .replace(/^ipfs:\/\//, "https://ipfs.io/ipfs/")
    .replace(/^ar:\/\//, "https://www.arweave.net/");
}

export default app;
