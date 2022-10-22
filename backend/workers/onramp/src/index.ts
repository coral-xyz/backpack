import fetch from "node-fetch";
import path from "path";
import { Hono } from "hono";

const app = new Hono();

const STRIPE_PROD_URL = "https://api.stripe.com/v1";
app.get("/session", async (c) => {
  // const chain = c.req.params.;
  // const publicKey =
  const data = await fetch(`${STRIPE_PROD_URL}/crypto/onramp_sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + btoa(c.env.STRIPE_SECRET),
    },
    // body: `transaction_details[wallet_address]=${}`
  });
  const json: any = await data.json();
  return c.json({ secret: json.client_secret });
});
