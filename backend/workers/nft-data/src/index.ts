import { Program } from "@project-serum/anchor";
import { metadata } from "@project-serum/token";
import { Connection, PublicKey } from "@solana/web3.js";
import { Hono } from "hono";

import { externalResourceUri } from "./externalResourceUri";
import { solanaNftMetadata } from "./solanaNftMetadata";
import type { Xnft } from "./xnft";
import { IDL, XNFT_PROGRAM_ID } from "./xnft";

const app = new Hono();

app.get("/xnft/:address", async (c) => {
  const { address } = c.req.param();
  console.log(address);
  const xnftClient = new Program<Xnft>(IDL, XNFT_PROGRAM_ID, {
    connection: new Connection("https://rpc-proxy.backpack.workers.dev/", {
      fetch: (request, init) => {
        return c.env.solanaRpc.fetch(new Request(request, init));
      },
    }),
  });
  const decodedAccount = await xnftClient.account.xnft.fetch(address);

  const masterMint = decodedAccount.masterMint;

  const metadata = await solanaNftMetadata(masterMint.toBase58(), c);

  const xnftJson = await (
    await fetch(externalResourceUri(decodedAccount.uri))
  ).json();

  const response = new Response(
    JSON.stringify({
      metadataAccount: metadata?.metadataAccount,
      metadata: metadata?.externalMetadata,
      xnftAccount: decodedAccount,
      xnft: xnftJson,
    })
  );

  response.headers.set("Content-Type", "application/json");
  response.headers.set(
    "Cache-Control",
    `max-age=${60 * 60}, s-maxage=${60 * 60}, stale-while-revalidate=${60 * 60}`
  );
  return response;
});

app.get("/metaplex-nft/:mintAddress/image", async (c) => {
  try {
    const { mintAddress } = c.req.param();
    const nftMetadata = await solanaNftMetadata(mintAddress, c);

    // @ts-ignore
    const imageUrl = nftMetadata?.externalMetadata?.image;

    if (!nftMetadata || !imageUrl) {
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
    const nftMetadata = await solanaNftMetadata(mintAddress, c);

    if (!nftMetadata?.externalMetadata) {
      return c.status(404);
    }
    const response = new Response(
      JSON.stringify(nftMetadata?.externalMetadata)
    );
    response.headers.set("Content-Type", "application/json");
    response.headers.set(
      "Cache-Control",
      `max-age=${60 * 60}, s-maxage=${60 * 60}, stale-while-revalidate=${
        60 * 60
      }`
    );
    return response;
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

export default app;
