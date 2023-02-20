export interface Env {
  // in secrets, see `npx wrangler secret --help`
  RPC_URL: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response("ok", {
        headers: {
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } else if (
      // POST for https
      request.method === "POST" ||
      // GET for websockets
      (request.method === "GET" && request.headers.get("Upgrade"))
    ) {
      const { href, hostname } = new URL(
        env.RPC_URL || "https://api.mainnet-beta.solana.com"
      );
      const rpcResponse = await fetch(
        href,
        (() => {
          const _request = new Request(href, request);
          // Only forward necessary headers from the client request
          sanitizeHeaders(_request.headers);
          return _request;
        })()
      );
      const response = new Response(rpcResponse.body, rpcResponse);
      // Add the RPC domain to the response headers for debugging purposes
      response.headers.append("x-backpack-rpc", hostname);
      return response;
    } else {
      return new Response(
        "Only POST, OPTIONS or WebSocket Upgrade GET requests are allowed",
        {
          status: 405,
        }
      );
    }
  },
};

const sanitizeHeaders = (headers: Headers) => {
  const allowedHeaders = [
    "accept-encoding",
    "accept",
    "cache-control",
    "connection",
    "content-encoding",
    "content-length",
    "content-type",
    "solana-client",
    "upgrade",
  ];
  headers.forEach((_value, key) => {
    if (!allowedHeaders.includes(key.toLowerCase())) {
      headers.delete(key);
    }
  });
};
