export interface Env {
  // in secrets, see `npx wrangler secret --help`
  RPC_URL: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    switch (request.method) {
      case "OPTIONS":
        return new Response("ok", {
          headers: {
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Origin": "*",
          },
        });
      case "POST":
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
      default:
        return new Response("Only POST or OPTIONS requests are allowed", {
          status: 405,
        });
    }
  },
};

const sanitizeHeaders = (headers: Headers) => {
  const allowedHeaders = [
    "accept-encoding",
    "accept",
    "cache-control",
    "connection",
    "content-length",
    "content-type",
    "solana-client",
  ];
  headers.forEach((_value, key) => {
    if (!allowedHeaders.includes(key.toLowerCase())) {
      headers.delete(key);
    }
  });
};
