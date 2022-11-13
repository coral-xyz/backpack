export interface Env {
  // in secrets, see `npx wrangler secret --help`
  RPC_URL: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "POST") {
      return await fetch(
        env.RPC_URL || "https://api.mainnet-beta.solana.com",
        request
      );
    } else {
      return new Response("Only POST requests are allowed", {
        status: 405,
      });
    }
  },
};
