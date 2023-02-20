import type { V4SwapPostRequest } from "@jup-ag/api";
import { Connection } from "@solana/web3.js";
import { createClient } from "@supabase/supabase-js";
import { Hono } from "hono";
import { importSPKI, jwtVerify } from "jose";

import ACCOUNTS from "./feeAccounts.json";

type MintAddress = keyof typeof ACCOUNTS | undefined;

const app = new Hono();

// start routes ----------------------------------------

app.post("/swap", async (c) => {
  try {
    const jwt = await jwtVerify(
      c.req.cookie("jwt")!,
      await importSPKI(c.env.AUTH_JWT_PUBLIC_KEY, "RS256"),
      {
        issuer: "auth.xnfts.dev",
        audience: "backpack",
      }
    );
    const userId = jwt.payload.sub;

    const json = (await c.req.json()) as any;
    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY);

    const { data } = await supabase
      .from("swaps")
      .insert({ signature: json.signature, user_id: userId })
      .select();

    // fail silently
    // if (error) throw new Error(error.message);
    return c.json(data);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

app.post("/swap-webhook", async (c) => {
  try {
    const json = (await c.req.json()) as any;
    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY);

    const conn = new Connection(c.env.RPC, "confirmed");
    const tx = await conn.getParsedTransaction(json.record.signature);

    const result = tx.meta
      .postTokenBalances!.filter(
        (t) =>
          t.owner === c.env.FEE_AUTHORITY_ADDRESS &&
          t.programId === c.env.TOKEN_PROGRAM_ADDRESS
      )
      ?.map((post) => {
        const pre = tx?.meta?.preTokenBalances?.find(
          (t) => t.accountIndex === post.accountIndex
        );
        return {
          ...post,
          fees:
            Number(post.uiTokenAmount.amount) -
            Number(pre.uiTokenAmount.amount),
        };
      });
    const [{ mint, fees }] = result;

    const { data, error } = await supabase
      .from("swaps")
      .update({ mint, fees, checked_at: new Date().toISOString() })
      .eq("signature", json.record.signature)
      .select();

    if (error) throw new Error(error.message);
    return c.json(data);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

app.use("/v4/quote", async (c) => {
  const url = (() => {
    let _url = changeOriginToJupiter(c.req.url);
    const params = new URLSearchParams(new URL(c.req.url).search);
    // If there's an account to receive fees for the output mint, append the feeBps
    const mint = params.get("outputMint") as MintAddress; // satisfies keyof Def0);
    return mint && ACCOUNTS[mint]
      ? _url.concat(`&feeBps=${c.env.DEFAULT_FEE_BPS}`)
      : _url;
  })();

  const response = await fetch(new Request(url, c.req));
  return response;
});

app.use("/v4/swap", async (c) => {
  let body = await c.req.json<V4SwapPostRequest["body"]>();

  try {
    // Inject feeAccount (if it exists) for the output mint address
    // TODO: check if there can be multiple output mint addresses
    const mint = body?.route.marketInfos?.[body?.route.marketInfos.length - 1]
      ?.outputMint as MintAddress;
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

app.use("/v4/*", async (c) => {
  const response = await fetch(
    new Request(changeOriginToJupiter(c.req.url), c.req)
  );
  return response;
});

//  TODO: add later and store in KV, not adding now due to node deps
// app.get("/accounts", async (c) => {
//   (async function () {
//     const fees: Record<string, { address: string }> = {};
//     (
//       await getPlatformFeeAccounts(
//         new Connection(c.env.RPC),
//         new PublicKey(c.env.FEE_AUTHORITY_ADDRESS)
//       )
//     ).forEach((account, mint) => {
//       fees[mint] = { address: account.toBase58() };
//     });
//     c.json(fees);
//   })();
// });

// end routes ----------------------------------------

const changeOriginToJupiter = (url: string) => {
  const { origin } = new URL(url);
  return url.replace(origin, "https://quote-api.jup.ag");
};

export default app;
