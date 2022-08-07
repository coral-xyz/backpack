// import { expect, test } from "@playwright/test";

import { chromium, test as base } from "@playwright/test";
import path from "path";

const extensionPath = path.join(__dirname, "../build"); // make sure this is correct

const test = base.extend({
  context: async ({ browserName }, use) => {
    const browserTypes = { chromium };
    const launchOptions = {
      devtools: false,
      headless: Boolean(process.env.CI),
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
    await use(context);
    await context.close();
  },
});

const EXTENSION_ID = "jclcndnaoggcdljhefioenkobihhahge";

test.describe("Setup", () => {
  test("our extension loads", async ({ page, context }) => {
    const VALID_PASSWORD = "password1234";

    const google = await context.newPage();

    await google.goto(`https://www.google.com`);
    await google.locator("text=Images").click();
    await google.close();

    await page.goto(
      `chrome-extension://${EXTENSION_ID}/options.html?onboarding=true`
    );
    await page.locator("text=Create a new Wallet").click();

    await page.locator('input[name="password"]').fill(VALID_PASSWORD);
    await page
      .locator('input[name="password-confirmation"]')
      .fill(VALID_PASSWORD);
    await page.locator("text=Next").click();

    await page.locator('input[type="checkbox"]').click();
    await page.locator("text=Next").click();

    await page.locator("text=Finish").click();

    const setup = await context.newPage();

    await setup.goto(`chrome-extension://${EXTENSION_ID}/popup.html`);
    await setup.locator('input[type="password"]').fill(VALID_PASSWORD);
    await setup.locator("text=Unlock").click();
  });
});
