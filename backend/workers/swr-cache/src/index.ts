import type { ExecuteRequest, ShouldCache, ToCacheKey } from "./swr";
import swr from "./swr";

interface Env {
  nftData: { fetch: (req: Request) => Promise<Response> };
  ethereumRpc: { fetch: (req: Request) => Promise<Response> };
  solanaRpc: { fetch: (req: Request) => Promise<Response> };
}

const toCacheKey: (
  c: ExecutionContext,
  env: Env,
  body: Promise<any>
) => ToCacheKey = (c, env, body) => async (req) => {
  const url = new URL(req.url);
  url.searchParams.delete("bust_cache");

  if (req.method === "GET" || req.method === "HEAD") {
    return new Request(url, {
      method: req.method,
    });
  }

  // Can't cache POST requests, so we're creating a GET cache key.
  url.searchParams.set(
    "postBody",
    encodeURIComponent(JSON.stringify(await body))
  );

  return new Request(url, {
    method: "GET",
  });
};

const excludeFromCache: string[] = [
  // "getHealth",
  // "getBalance",
  // "getProgramAccounts",
];
const shouldCache: (
  c: ExecutionContext,
  env: Env,
  body: Promise<any>
) => ShouldCache = (c, env, body) => async (req, res) => {
  // dont cache failed requests
  if (!res.ok) {
    return false;
  }
  // cache all get requests ////////////////
  if (req.method === "GET") {
    return true;
  }

  const [service] = extractService(new URL(req.url));

  // cache posts to specific rpc methods ///////////////
  if (service === "rpc-proxy" || service === "solana-rpc-proxy") {
    const method = (await body)?.method ?? "";
    if (
      method &&
      method.startsWith("get") &&
      !excludeFromCache.includes(method)
    ) {
      return true;
    }
  }

  // cache posts to specific rpc methods ///////////////
  if (service === "ethereum-rpc-proxy") {
    const method = (await body)?.method ?? "";
    if (
      method &&
      method.startsWith("eth_get") &&
      !excludeFromCache.includes(method)
    ) {
      return true;
    }
  }

  return false;
};

const executeRequest: (c: ExecutionContext, env: Env) => ExecuteRequest =
  (_c, env) => async (req) => {
    const [service, url] = extractService(new URL(req.url));

    // calling data worker internally... works without and might not be necessary.
    if (service === "nft-data") {
      return env.nftData.fetch(new Request(url, req));
    }

    if (service === "web") {
      const proxiedUrl = url.pathname.slice(1);
      const fetched = await fetch(proxiedUrl);
      const response = new Response(fetched.body, fetched);
      return response;
    }

    if (service === "1min") {
      const proxiedUrl = url.pathname.slice(1);
      console.log("web", proxiedUrl);
      const fetched = await fetch(proxiedUrl);
      const response = new Response(fetched.body, fetched);
      response.headers.set(
        "Cache-Control",
        `max-age=${60}, s-maxage=${60}, stale-while-revalidate=${60}`
      );
      return response;
    }

    if (service === "1hr") {
      const proxiedUrl = url.pathname.slice(1);
      console.log("1hr", proxiedUrl);
      const fetched = await fetch(proxiedUrl);
      const response = new Response(fetched.body, fetched);
      response.headers.set(
        "Cache-Control",
        `max-age=${60 * 60}, s-maxage=${60 * 60}, stale-while-revalidate=${60}`
      );
      return response;
    }

    if (service === "images") {
      url.host = `images.xnfts.dev`;
      // return new Response("hello");
      console.log("images", url.toString());
      const fetched = await fetch(url);
      const response = new Response(fetched.body, fetched);
      response.headers.set(
        "Cache-Control",
        `max-age=${60 * 60 * 24 * 30}, s-maxage=${
          60 * 60 * 24 * 30
        }, stale-while-revalidate=${60 * 60 * 24 * 30}`
      );
      return response;
    }

    if (service === "rpc-proxy" || service === "solana-rpc-proxy") {
      url.host = `rpc-proxy.backpack.workers.dev`;
      console.log("solana-rpc-proxy", url.toString());
      const fetched = await env.solanaRpc.fetch(new Request(url, req));
      const response = new Response(fetched.body, fetched);
      response.headers.set(
        "Cache-Control",
        `max-age=${1}, s-maxage=${1}, stale-while-revalidate=${5}`
      );
      return response;
    }

    if (service === "ethereum-rpc-proxy") {
      url.host = `ethereum-rpc-proxy.backpack.workers.dev`;
      console.log("ethereum-rpc-proxy", url.toString());
      const fetched = await env.ethereumRpc.fetch(new Request(url, req));
      const response = new Response(fetched.body, fetched);
      response.headers.set(
        "Cache-Control",
        `max-age=${1}, s-maxage=${1}, stale-while-revalidate=${5}`
      );
      return response;
    }

    if (service === "avatars") {
      const path = url.pathname.slice(1).split("/");
      // remove cache_bust path segment
      if (path.length === 2) {
        path.pop();
      }
      url.pathname = `/${path.join("/")}`;
      // url.host = `${service}.backpack.workers.dev`;
      // return fetch(new Request(url, req));
    }

    url.host = `${service}.backpack.workers.dev`;
    console.log(service, url.toString());
    return fetch(new Request(url, req));
  };

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const body =
      request.method === "POST"
        ? request.clone().json()
        : Promise.resolve(null);

    const swrResponse = await swr(
      request,
      ctx,
      executeRequest(ctx, env),
      shouldCache(ctx, env, body),
      toCacheKey(ctx, env, body)
    );

    const response = new Response(swrResponse.body, swrResponse);
    response.headers.set("Access-Control-Allow-Origin", `*`);
    return response;
  },
};

const extractService = (url: URL): [string | undefined, URL] => {
  const path = url.pathname.slice(1).split("/");
  const service = path.shift();
  url.pathname = `/${path.join("/")}`;
  return [service, url];
};
