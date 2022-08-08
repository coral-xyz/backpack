// import { expect, test } from "@playwright/test";

import { chromium, expect, test as base } from "@playwright/test";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import path from "path";

const extensionPath = path.join(__dirname, "../build"); // make sure this is correct

const test = base.extend({
  context: async ({ browserName }, use) => {
    const browserTypes = { chromium };
    const launchOptions = {
      devtools: false,
      headless: false,
      args: [`--disable-extensions-except=${extensionPath}`],
      viewport: {
        width: 400,
        height: 700,
      },
    };
    const context = await browserTypes[browserName].launchPersistentContext(
      "",
      launchOptions
    );
    context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await use(context);
    await context.close();
  },
});

const ExtensionId = {
  DEV: "ppbliddanlojgfoeknmmdniicoccellh",
  PROD: "onehipemlbcjfecgbeimidpecoofepan",
};

const EXTENSION_ID = ExtensionId.PROD;

test("create a wallet and send SOL", async ({ page, context }) => {
  const VALID_PASSWORD = "password1234";

  // ------------------------- OPEN THE ONBOARDING PAGE
  await page.goto(
    `chrome-extension://${EXTENSION_ID}/options.html?onboarding=true`
  );

  // ------------------------- CREATE A NEW WALLET

  await page.locator("text=Create a new Wallet").click();

  await page.locator('input[name="password"]').fill(VALID_PASSWORD);
  await page
    .locator('input[name="password-confirmation"]')
    .fill(VALID_PASSWORD);
  await page.locator("text=Next").click();

  await page.locator('input[type="checkbox"]').click();
  await page.locator("text=Next").click();

  await page.locator("text=Finish").click();

  // ------------------------- OPEN THE WALLET POPUP

  const setup = await context.newPage();

  await setup.goto(`chrome-extension://${EXTENSION_ID}/popup.html`);

  // ------------------------- UNLOCK THE WALLET

  await setup.locator('input[type="password"]').fill(VALID_PASSWORD);
  await setup.locator("text=Unlock").click();

  // ------------------------- COPY THE PUBLIC KEY TO THE CLIPBOARD

  await setup.locator("text=Receive").click();
  await setup.locator("text=Wallet 1").click();
  const pubkey = await setup.evaluate(() => navigator.clipboard.readText());

  // ------------------------- AIRDROP 1 SOL TO THE WALLET

  const conn = new Connection("http://localhost:8899", "confirmed");
  const wallet = new PublicKey(pubkey);
  await conn.requestAirdrop(wallet, 1e9);

  // ------------------------- CHANGE THE CONNECTION TO LOCALNET

  await setup.locator("#menu-button").click();
  await setup.locator("text=Preferences").click();
  await setup.locator("text=RPC Connection").click();
  await setup.locator("text=Localnet").click();

  // ------------------------- CHECK THE AIRDROP WAS RECEIVED

  await setup.locator("text=1.0 SOL").click();
  await setup.locator("#token-send").click();

  // ------------------------- SEND 0.5 SOL TO ANOTHER PUBKEY

  const to = Keypair.generate().publicKey;

  await setup.locator('input[name="to"]').fill(String(to));
  await setup.locator('input[name="amount"]').fill("0.5");
  await setup.locator("[data-testid='Send']").click();
  await setup.locator("[data-testid='confirm-send']").click();
  await setup.locator("text=View Balances").click();

  // ------------------------- CHECK THE BALANCES ARE AS EXPECTED

  expect((await conn.getBalance(wallet)).toString()).toEqual("499995000");
  expect((await conn.getBalance(to)).toString()).toEqual("500000000");

  // this takes a several seconds to update
  await setup.locator("text=0.499995 SOL").click();
});
