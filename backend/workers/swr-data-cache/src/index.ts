import type { ExecuteRequest, ShouldCache, ToCacheKey } from "./swr";
import swr from "./swr";

interface Env {
  data: { fetch: (req: Request) => Promise<Response> };
  rpc: { fetch: (req: Request) => Promise<Response> };
}

const toCacheKey: (
  c: ExecutionContext,
  env: Env,
  body: Promise<any>
) => ToCacheKey = (c, env, body) => async (req) => {
  if (req.method === "GET" || req.method === "HEAD") {
    return new Request(req.url, {
      method: req.method,
    });
  }
  // Can't cache POST requests, so we're creating a GET cache key.
  return new Request(
    req.url + "?" + encodeURIComponent(JSON.stringify(await body)),
    {
      method: "GET",
    }
  );
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
  // cache all get requests
  if (req.method === "GET") {
    return true;
  }
  const [service] = extractService(new URL(req.url));
  // cache posts to specific rpc methods
  if (service === "rpc-proxy") {
    const method = (await body)?.method ?? "";
    if (
      method &&
      method.startsWith("get") &&
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

    if (service === "data") {
      return env.data.fetch(new Request(url, req));
    }

    if (service === "rpc-proxy") {
      const fetched = await env.rpc.fetch(new Request(url, req));
      return new Response(fetched.body, {
        headers: new Headers([
          [
            "Cache-Control",
            `max-age=${1}, s-maxage=${1}, stale-while-revalidate=${5}`,
          ],
        ]),
      });
    }

    url.host = `${service}.backpack.workers.dev`;
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
    return swr(
      request,
      ctx,
      executeRequest(ctx, env),
      shouldCache(ctx, env, body),
      toCacheKey(ctx, env, body)
    );
  },
};

const extractService = (url: URL): [string | undefined, URL] => {
  const path = url.pathname.slice(1).split("/");
  const service = path.shift();
  url.pathname = `/${path.join("/")}`;
  return [service, url];
};
