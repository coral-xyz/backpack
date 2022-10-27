import { Hono } from "hono";
import { BlockChain, CreateSessionRequest } from "./zodTypes";
import { validatePulicKey } from "./validate";

const app = new Hono();

const STRIPE_PROD_URL = "https://api.stripe.com/v1";

app.get("/", (c) => {
  return c.json("ok", 200);
});

app.get("/session", async (c) => {
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
    c.json({ message: "invalid input" }, 411);
    return;
  }

  if (!validatePulicKey(publicKey, chain)) {
    c.json({ message: "invalid public key" }, 411);
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
    if (!json.client_secret) {
      throw new Error("Client secret not returned from Stripe");
    }
    return c.json({ secret: json.client_secret });
  } catch (e) {
    return c.json({ message: "Error while getting secret from Stripe" }, 400);
  }
});

export default app;
