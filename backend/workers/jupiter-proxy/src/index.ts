import { Chain } from "@coral-xyz/zeus";
import type { V4SwapPostRequest } from "@jup-ag/api";
import { Connection } from "@solana/web3.js";
import { Hono } from "hono";

type HasuraWebhook = {
  created_at: string;
  delivery_info: {
    current_retry: number;
    max_retries: number;
  };
  event: {
    data: {
      new: {
        created_at: string;
        distributor_id: any;
        fee_account_address: any;
        fee_amount: any;
        fee_mint_address: any;
        fee_payer_id: any;
        fee_payer_public_key: any;
        id: string;
        transaction_at: any;
        transaction_signature: string;
      };
      old: null;
    };
    op: string;
    session_variables: {
      "x-hasura-role": string;
    };
    trace_context: {
      sampling_state: string;
      span_id: string;
      trace_id: string;
    };
  };
  id: string;
  table: {
    name: string;
    schema: string;
  };
  trigger: {
    name: string;
  };
};

import ACCOUNTS from "./feeAccounts.json";

type MintAddress = keyof typeof ACCOUNTS | undefined;

type Env = {
  DEFAULT_FEE_BPS: number;
  FEE_AUTHORITY_ADDRESS: string;
  RPC: string;
  TOKEN_PROGRAM_ADDRESS: string;
  // secrets
  AUTH_JWT_PUBLIC_KEY: string;
  HASURA_JWT: string;
  HASURA_URL: string;
  WEBHOOK_PASSWORD: string;
};

const app = new Hono<{ Bindings: Env }>();

// start routes ----------------------------------------

app.post("/swap", async (c) => {
  // removed, but keep the route to avoid breaking the frontend
  return c.json({ ok: true, message: "no-op" });
});

app.post("/swap-webhook", async (c) => {
  // do nothing for dev env
  if (c.env.WEBHOOK_PASSWORD === "PLACEHOLDER") {
    return c.json({ ok: true });
  } else if (c.req.header("x-password") !== c.env.WEBHOOK_PASSWORD) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const json = (await c.req.json()) as HasuraWebhook;
    const signature = json.event.data.new.transaction_signature;

    const conn = new Connection(c.env.RPC);
    const tx = await conn.getParsedTransaction(signature, {
      maxSupportedTransactionVersion: 0,
      commitment: "confirmed",
    });
    const result = tx!
      .meta!.postTokenBalances!.filter((t) => {
        return t.owner === c.env.FEE_AUTHORITY_ADDRESS;
        // && t.programId === c.env.TOKEN_PROGRAM_ADDRESS
      })
      ?.map((post) => {
        const pre = tx!.meta!.preTokenBalances!.find(
          (t) => t.accountIndex === post.accountIndex
        )!;
        return {
          ...post,
          fees:
            Number(post.uiTokenAmount.amount) -
            Number(pre!.uiTokenAmount.amount),
        };
      });
    const [{ mint, fees }] = result;

    if (Number(fees) <= 0) {
      throw new Error("fees must be greater than 0");
    }

    const chain = Chain(c.env.HASURA_URL, {
      headers: { Authorization: `Bearer ${c.env.HASURA_JWT}` },
    });

    const data = await chain("mutation")(
      {
        update_auth_swaps: [
          {
            where: {
              transaction_signature: { _eq: signature },
            },
            _set: {
              fee_mint_address: mint,
              fee_amount: fees,
              fee_account_address:
                ACCOUNTS[mint as keyof typeof ACCOUNTS]?.address,
              transaction_at: tx?.blockTime
                ? new Date(tx?.blockTime * 1000).toISOString()
                : undefined,
            },
          },
          { affected_rows: true },
        ],
      },
      { operationName: "updateSwap" }
    );

    if (data.update_auth_swaps?.affected_rows !== 1) {
      throw new Error("unable to update transaction");
    }

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

  const response = await fetch(url, c.req);
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

// end routes ----------------------------------------

const changeOriginToJupiter = (url: string) => {
  const ob = new URL(url);
  ob.protocol = "https:";
  ob.host = "quote-api.jup.ag";
  ob.port = "";
  return ob.href;
};

export default app;
