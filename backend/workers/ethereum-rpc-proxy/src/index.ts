export interface Env {
  // in secrets, see `npx wrangler secret --help`
  RPC_URL: string;
  NFT_RPC_URL: string;
  ALCHEMY_API_KEY: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    };
    if (request.method === "OPTIONS") {
      return new Response("ok", {
        headers: corsHeaders,
      });
    }

    if (request.method === "POST") {
      return await fetch(
        env.RPC_URL ||
          `https://eth-mainnet.g.alchemy.com/v2/${env.ALCHEMY_API_KEY}`,
        request
      );
    } else {
      const [service, url] = extractService(new URL(request.url));
      if (request.method === "GET" && service === "nft") {
        const newUrl =
          env.NFT_RPC_URL ||
          `https://eth-mainnet.g.alchemy.com/nft/v2/${env.ALCHEMY_API_KEY}`;
        return await fetch(
          newUrl + url.pathname + url.search + url.hash,
          request
        );
      }
      return new Response("Invalid Request", {
        status: 405,
      });
    }
  },
};

const extractService = (url: URL): [string | undefined, URL] => {
  const path = url.pathname.slice(1).split("/");
  const service = path.shift();
  url.pathname = `/${path.join("/")}`;
  return [service, url];
};
