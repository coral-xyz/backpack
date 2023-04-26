import base32Decode from "base32-decode";
import base32Encode from "base32-encode";
import base58 from "bs58";

import { externalResourceUri } from "./externalResourceUri";
import type { ExecuteRequest } from "./swr";
import swr from "./swr";

interface Env {
  nftData: { fetch: (req: Request) => Promise<Response> };
}

const executeRequest: (c: ExecutionContext, env: Env) => ExecuteRequest =
  (c, env) => async (req) => {
    // const hex = base32Encode(base58.decode("CkqWjTWzRMAtYN3CSs8Gp4K9H891htmaN1ysNXqcULc8"), "RFC4648", { padding: false });
    // console.log("b32", hex);

    //one: V2VWEZTQK3UTC2FPUT6E4RHCOHT7B5XIALOAVQEA2IOJ4ARBJUEQ
    //prices: GCGIAOFNGABKI2FQRWUGEWWJBQKRGVBDC4Q4HUVRHNXWLA4DKOSA
    // const url = new URL("https://GCGIAOFNGABKI2FQRWUGEWWJBQKRGVBDC4Q4HUVRHNXWLA4DKOSA.gateway.xnfts.dev/madfeed");
    const url = new URL(req.url);

    const xnftAddress32 = url.hostname.split(".gateway.xnfts.dev")[0];
    const xnftAddress = base58.encode(
      Buffer.from(base32Decode(xnftAddress32.toUpperCase(), "RFC4648"))
    );

    const xnftMetadataResponse = await swr(
      new Request("https://nft-data.backpack.workers.dev/xnft/" + xnftAddress),
      c,
      env.nftData.fetch.bind(env.nftData)
    );

    const xnftMetadata: any = await xnftMetadataResponse.json();
    const entrypoint = externalResourceUri(
      xnftMetadata?.metadata?.xnft?.manifest?.entrypoints?.default?.web
    );
    const isImmutable =
      entrypoint.startsWith("ar://") || entrypoint.startsWith("ipfs://");

    // if url points to a file (last path segment includes ".") remove it -> hacky.
    const urlSegments = entrypoint.split("/");
    const lastSegment = urlSegments[urlSegments.length - 1];
    if (lastSegment.includes(".") || lastSegment === "") {
      urlSegments.pop();
    }

    const newUrl =
      urlSegments.join("/") + (url.pathname === "/" ? "" : url.pathname);

    const fetched = await fetch(new Request(newUrl, req));
    const response = new Response(fetched.body, fetched);

    if (isImmutable) {
      response.headers.set(
        "Cache-Control",
        `max-age=${60}, s-maxage=${60}, stale-while-revalidate=${60}`
      ); //1min swr
    }
    // WHITELIST SPECIAL CASE
    else if (
      xnftAddress === "CkqWjTWzRMAtYN3CSs8Gp4K9H891htmaN1ysNXqcULc8" &&
      !url.pathname.startsWith("/api/")
    ) {
      response.headers.set(
        "Cache-Control",
        `max-age=${60}, s-maxage=${60}, stale-while-revalidate=${60}`
      ); //1min swr
    }

    return response;
  };

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    return swr(request, ctx, executeRequest(ctx, env));
  },
};
