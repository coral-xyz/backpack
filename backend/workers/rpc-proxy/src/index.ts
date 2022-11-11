export interface Env {
  // in secrets, see `npx wrangler secret --help`
  RPC_URL: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return await fetch(
      env.RPC_URL || "https://api.mainnet-beta.solana.com",
      request
    );
  },
};
