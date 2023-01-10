import type { V4SwapPostRequest } from "@jup-ag/api";
import { Hono } from "hono";

import ACCOUNTS from "./feeAccounts.json";

// This worker forwards requests to Jupiter, but it injects fees for referrals etc.

const FEE_BPS = 85 as const;

type MintAddress = keyof typeof ACCOUNTS | undefined;

const app = new Hono();

// start routes ----------------------------------------

app.use("/v4/quote", async (c) => {
  const url = (() => {
    let _url = changeOriginToJupiter(c.req.url);
    const params = new URLSearchParams(new URL(c.req.url).search);
    // If there's an account to receive fees for the output mint, append the feeBps
    const mint = params.get("outputMint") as MintAddress; // satisfies keyof Def0);
    return mint && ACCOUNTS[mint] ? _url.concat(`&feeBps=${FEE_BPS}`) : _url;
  })();

  const response = await fetch(new Request(url, c.req));
  return response;
});

app.use("/v4/swap", async (c) => {
  let body = await c.req.json<V4SwapPostRequest["body"]>();

  try {
    // Inject feeAccount (if it exists) for the output mint address
    // TODO: check if there can be multiple output mint addresses
    const mint = body?.route.marketInfos?.[0]?.outputMint as MintAddress;
    if (body && mint && ACCOUNTS[mint]) {
      body.feeAccount = ACCOUNTS[mint].address;
    }
  } catch (err) {
    console.error("error injecting feeAccount", err);
  }

  console.log(body);

  const response = await fetch(changeOriginToJupiter(c.req.url), {
    method: c.req.method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return response;
});

app.use("*", async (c) => {
  const response = await fetch(
    new Request(changeOriginToJupiter(c.req.url), c.req)
  );
  return response;
});

// end routes ----------------------------------------

const changeOriginToJupiter = (url: string) => {
  const { origin } = new URL(url);
  return url.replace(origin, "https://quote-api.jup.ag");
};

export default app;
