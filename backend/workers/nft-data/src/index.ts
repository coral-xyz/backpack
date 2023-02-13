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

    const jsonMetadata = await getMintMetadata(mintAddress, c);

    // @ts-ignore
    const imageUrl = jsonMetadata?.image;

    if (!jsonMetadata || !imageUrl) {
      return c.status(404);
    }

    if (imageUrl.startsWith("data:")) {
      const [header, data] = imageUrl.split(",");
      const [_protocol, contentTypeEncoding] = header.split(":");
      const [contentType, _encoding] = contentTypeEncoding.split(";");
      const image = Buffer.from(data, "base64");
      const response = new Response(image);
      response.headers.set("Content-Type", contentType);
      response.headers.set(
        "Cache-Control",
        `max-age=${60 * 5}, s-maxage=${60 * 5}, stale-while-revalidate=${
          60 * 5
        }`
      );
      return response;
    } else {
      const imageResponse = await fetch(externalResourceUri(imageUrl));
      const response = new Response(imageResponse.body);
      response.headers.set(
        "Cache-Control",
        `max-age=${60 * 5}, s-maxage=${60 * 5}, stale-while-revalidate=${
          60 * 5
        }`
      );
      return response;
    }
  } catch (e) {
    console.error(e);
    return c.status(500);
  }
});

app.get("/metaplex-nft/:mintAddress/metadata", async (c) => {
  try {
    const { mintAddress } = c.req.param();

    const jsonMetadata = await getMintMetadata(mintAddress, c);
    return c.json({
      //@ts-ignore
      ticker: jsonMetadata?.ticker ?? jsonMetadata?.name ?? "",
    });
  } catch (e) {
    console.error(e);
    return c.status(500);
  }
});

app.get("/ethereum-nft/:contractAddress/:tokenId/image", async (c) => {
  try {
    const { contractAddress, tokenId } = c.req.param();

    const metadataResponse = await c.env.ethereumRpc.fetch(
      new Request(
        `https://ethereum-rpc-proxy.backpack.workers.dev/nft/getNFTMetadata?contractAddress=${contractAddress}&tokenId=${tokenId}`
      )
    );

    const metadata = await metadataResponse.json();
    // @ts-ignore
    const imageUrl = metadata?.metadata?.image;

    if (!metadata || !imageUrl) {
      return c.status(404);
    }

    if (imageUrl.startsWith("data:")) {
      const [header, data] = imageUrl.split(",");
      const [_protocol, contentTypeEncoding] = header.split(":");
      const [contentType, _encoding] = contentTypeEncoding.split(";");
      const image = Buffer.from(data, "base64");

      const response = new Response(image);
      response.headers.set("Content-Type", contentType);
      response.headers.set(
        "Cache-Control",
        `max-age=${60 * 5}, s-maxage=${60 * 5}, stale-while-revalidate=${
          60 * 5
        }`
      );
      return response;
    } else {
      // console.log(JSON.stringify(metadata))
      const imageResponse = await fetch(externalResourceUri(imageUrl));
      const response = new Response(imageResponse.body);
      response.headers.set(
        "Cache-Control",
        `max-age=${60 * 5}, s-maxage=${60 * 5}, stale-while-revalidate=${
          60 * 5
        }`
      );
      return response;
    }
  } catch (e) {
    console.error(e);
    return c.status(500);
  }
});

function externalResourceUri(uri: string): string {
  return uri
    .replace(/^ipfs:\/\//, "https://ipfs.io/ipfs/")
    .replace(/^ar:\/\//, "https://www.arweave.net/");
}

async function getMintMetadata(mintAddress: string, c) {
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
  const jsonMetadata = await (
    await fetch(externalResourceUri(parsedMetadata.data.uri))
  ).json();

  return jsonMetadata ?? null;
}

export default app;
