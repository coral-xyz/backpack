export interface Env {
  // in secrets, see `npx wrangler secret --help`
  RPC_URL: string;
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
          "https://eth-mainnet.g.alchemy.com/v2/DlJr6QuBC2EaE-L60-iqQQGq9hi9-XSZ",
        request
      );
    } else {
      return new Response("Only POST requests are allowed", {
        status: 405,
      });
    }
  },
};
