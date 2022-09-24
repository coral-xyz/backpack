/**
 * Solana Auth worker @ https://solanauth.backpack.workers.dev
 *
 * based off ideas from
 * https://github.com/solana-labs/solana/issues/21366#issuecomment-1194310677
 * https://github.com/web3auth/sign-in-with-solana
 *
 * GET    /           - returns "OK" to confirm worker is running
 * GET    /:publicKey - Get a prepared fake auth transaction for the given pubkey
 * POST   /:publicKey - Validate a fake auth signed transaction, TODO: return JWT
 */

import { Hono } from "hono";
import { ParsedMessage } from "./regex";
import {
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";

// TODO: move to env
const URI = "https://backpack.app";
const CHAIN_ID = "1";
const SECONDS_UNTIL_EXPIRY = "30";
const NONCE_LENGTH = "20";
const MEMO_PROGRAM_ADDRESS = "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr";
const STATEMENT = "Sign in with Solana to the app.";

const MEMO_PROGRAM_ID = new PublicKey(MEMO_PROGRAM_ADDRESS);

const app = new Hono();

app.get("/", (c) => c.text("ok"));

app.get("/:publicKey", async (c) => {
  const { hostname, origin } = new URL(URI);

  const pk = new PublicKey(c.req.param("publicKey"));
  const now = new Date();
  const msg = Object.entries({
    URI: origin,
    Version: 1,
    "Chain ID": Number(CHAIN_ID),
    Nonce: "???",
    "Issued At": now.toISOString(),
    "Expiration Time": addSeconds(
      now,
      Number(SECONDS_UNTIL_EXPIRY)
    ).toISOString(),
  }).reduce(
    (acc, [k, v]) => acc.concat(`${k}: ${v}\n`),
    `${hostname} wants you to sign in with your Solana account:
${pk.toString()}

${STATEMENT}

`
  );
  const message = msg.replace("???", await generateNonceHash(msg));
  const tx = new Transaction();
  tx.add(
    new TransactionInstruction({
      programId: MEMO_PROGRAM_ID,
      keys: [],
      data: Buffer.from(message, "utf8"),
    })
  );
  tx.feePayer = pk;
  // Not actually needed as it's not transmitted to the network
  tx.recentBlockhash = Keypair.generate().publicKey.toString();
  return c.text(
    tx.serialize({ requireAllSignatures: false }).toString("base64")
  );
});

app.post("/:publicKey", async (c) => {
  const publicKey = new PublicKey(c.req.param("publicKey"));
  const tx = Transaction.from(Buffer.from(await c.req.text(), "base64"));
  return c.json(await validateAuthTx(tx, publicKey));
});

export default app;

const validateAuthTx = async (
  tx: Transaction,
  pk: PublicKey
): Promise<boolean> => {
  try {
    const inx = tx.instructions[0];
    if (!inx.programId.equals(MEMO_PROGRAM_ID))
      throw new Error("Invalid program ID");

    const data = new TextDecoder().decode(inx.data);
    const expectedNonce = await generateNonceHash(
      data.replace(/Nonce: (.+)\n/, "Nonce: ???\n")
    );
    const parsed = new ParsedMessage(data);

    if (parsed.address !== pk.toString()) throw new Error("Invalid address");
    if (parsed.nonce !== expectedNonce) throw new Error("Invalid nonce");
    if (parsed.statement !== STATEMENT) throw new Error("Invalid message");

    const now = new Date();
    if (!parsed.issuedAt || parsed.issuedAt >= now)
      throw new Error("Invalid issuedAt");
    if (!parsed.expirationTime || parsed.expirationTime < now)
      throw new Error("Expired");

    if (!tx.verifySignatures()) throw new Error("Unable to verify signatures");
    if (!tx.signatures.some(({ publicKey }) => pk.equals(publicKey))) {
      throw new Error(`Could not find public key ${pk.toString()}`);
    }
  } catch (err) {
    console.error(err);
    return false;
  }
  return true;
};

// TODO: decide if nonce should be a random set of chars or hash with secret salt
const generateNonceHash = async (message: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex.substring(0, Number(NONCE_LENGTH));
};

const addSeconds = (date: Date, seconds: number) => {
  const now = new Date(date);
  now.setSeconds(now.getSeconds() + seconds);
  return now;
};
