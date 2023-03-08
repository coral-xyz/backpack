import { Hono } from "hono";
import { updateSession, createSession, getSession } from "./db";
import { BlockChain, CreateSessionRequest } from "./zodTypes";
import { validatePublicKey } from "./validate";
import stripe from "stripe";

const STRIPE_PROD_URL = "https://api.stripe.com/v1";

export const registerOnRampHandlers = (app: Hono) => {
  app.post("/onramp/webhook", async (c) => {
    const sig = c.req.headers.get("stripe-signature");
    const body = await c.req.json();

    try {
      stripe.webhooks.constructEvent(c.req.body, sig, c.env.SIGNING_SECRET);
      const status = body.data?.object.status;
      const clientSecret = body.data.object.client_secret;
      await updateSession(
        c.env.HASURA_URL,
        c.env.JWT,
        clientSecret,
        status,
        JSON.stringify(body)
      );
    } catch (err: any) {
      console.error(err);
      return c.json(`Webhook Error: ${err?.message}`, 400);
    }
    return c.json("ok", 200);
  });

  app.post("/onramp/session", async (c) => {
    const { searchParams } = new URL(c.req.url);
    // @ts-ignore
    let chain: BlockChain = searchParams.get("chain");
    let publicKey: string = searchParams.get("publicKey") || "";

    try {
      CreateSessionRequest.parse({
        chain,
        publicKey,
      });
    } catch (e) {
      return c.json({ message: "invalid input" }, 411);
    }

    if (!validatePublicKey(publicKey, chain)) {
      return c.json({ message: "invalid public key" }, 411);
    }
    try {
      const data = await fetch(`${STRIPE_PROD_URL}/crypto/onramp_sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: "Basic " + btoa(c.env.STRIPE_SECRET),
        },
        body: `transaction_details[wallet_address]=${publicKey}&transaction_details[supported_destination_networks][]=${chain}`,
      });
      const json: any = await data.json();
      await createSession(
        c.env.HASURA_URL,
        c.env.JWT,
        publicKey,
        json.client_secret
      );
      if (!json.client_secret) {
        throw new Error("Client secret not returned from Stripe");
      }
      return c.json({ secret: json.client_secret });
    } catch (e) {
      return c.json({ message: "Error while getting secret from Stripe" }, 400);
    }
  });

  app.get("/onramp/session/:client_secret", async (c) => {
    const client_secret = c.req.param("client_secret");
    const response = await getSession(
      c.env.HASURA_URL,
      c.env.JWT,
      client_secret
    );
    const status = response.auth_stripe_onramp[0].status;
    if (!status) {
      return c.json({ message: "Session not found" }, 400);
    }
    return c.json({ status }, 200);
  });
};
