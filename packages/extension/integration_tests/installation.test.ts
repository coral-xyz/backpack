import { generateMnemonic } from "bip39";
import "expect-puppeteer";
import type { Page } from "puppeteer";
import manifest from "../public/manifest.json";

let extensionPopupPage: Page;
let setupPage: Page;

describe("Installing Anchor Wallet", () => {
  // Our test browser has already installed the extension code in ./build
  // see jest-puppeteer.config.js for details about that.
  // Now we need to get the unique ID of the browser extension and
  // then we can open a URL like chrome-extension://EXTENSION_ID/popup.html
  beforeAll(async () => {
    const extensionID = await (async () => {
      const targets = await browser.targets();
      const extensionTarget = targets.find(
        (target) => target.type() === "service_worker"
      );

      // @ts-ignore
      const partialExtensionUrl = extensionTarget._targetInfo.url;
      const [, , id] = partialExtensionUrl.split("/");
      return id;
    })();

    extensionPopupPage = await browser.newPage();

    // @ts-ignore
    const popupFile = manifest.browser_action.default_popup;
    const popupURL = `chrome-extension://${extensionID}/${popupFile}`;

    await extensionPopupPage.goto(popupURL);

    setupPage = await (
      await browser.waitForTarget(
        (target) => target.opener() === extensionPopupPage.target()
      )
    ).page();
  });

  // A hacky way to start each test from the same place, because state isn't
  // currently stored between refreshes and there's no router, we can reset
  // the state by reloading the page
  beforeEach(async () => {
    await setupPage.reload();
  });

  describe("setting up a new wallet", () => {
    // Click the 'Create wallet' button before each test in this block
    beforeEach(async () => {
      await expect(setupPage).toClick("button", { text: "Create" });
    });

    test("succeeds with a valid password and confirmation", async () => {
      await expect(setupPage).toFillForm("form", {
        password: "validpassword",
        "password-confirmation": "validpassword",
      });
      await expect(setupPage).toClick("button", { text: "Continue" });

      await expect(setupPage).toMatch("Secret Recovery Phrase");

      // a fast & weak test to ensure that there's a seed phrase shown,
      // will break with different languages
      await expect(setupPage).toMatch(/([a-z]{3,10} ){23,}([a-z]{3,10})/);

      await expect(setupPage).toClick("button", { text: "Continue" });

      await expect(setupPage).toMatch("all done");

      await expect(setupPage).toClick("button", { text: "Finish" });

      // XXX: temporarily disabled so that setupPage can be used below
      // await extensionPopupPage.reload();
      // await expect(extensionPopupPage).toMatch("Balances");
    });

    describe("fails when using", () => {
      test("a password that's too short", async () => {
        await expect(setupPage).toFillForm("form", {
          password: "short",
          "password-confirmation": "short",
        });
        await expect(setupPage).toClick("button", { text: "Continue" });
        await expect(setupPage).toMatch("Password must be longer");
      });

      test("a mismatched password and confirmation", async () => {
        await expect(setupPage).toFillForm("form", {
          password: "password",
          "password-confirmation": "different",
        });
        await expect(setupPage).toClick("button", { text: "Continue" });
        await expect(setupPage).toMatch("Passwords don't match");
      });

      test.skip("no password", async () => {
        await expect(setupPage).toClick("button", { text: "Continue" });
      });
    });
  });

  describe("importing an existing wallet", () => {
    // Click the 'Import seed phrase' button before each test in this block
    beforeEach(async () => {
      await expect(setupPage).toClick("button", { text: "Import" });
    });

    // TODO: Make 'happy path' test run first.
    //       Test order is currently SIGNIFICANT, which is not ideal. The
    //       final test closes `setupPage`, which means it can't be used
    //       in any of the following tests.

    test("fails with an invalid mnemonic", async () => {
      await expect(setupPage).toFill("input[name=mnemonic]", "blah blah blah");
      await expect(setupPage).toClick("button", { text: "Continue" });
      await expect(setupPage).toMatch("Invalid secret recovery phrase");
    });

    test("succeeds with a valid mnemonic", async () => {
      await expect(setupPage).toFill(
        "input[name=mnemonic]",
        generateMnemonic(256)
      );
      await expect(setupPage).toClick("button", { text: "Continue" });

      await expect(setupPage).toMatch("Your first account will be imported");

      await expect(setupPage).toClick("button", { text: "Continue" });

      await expect(setupPage).toFillForm("form", {
        password: "validpassword",
        "password-confirmation": "validpassword",
      });

      await expect(setupPage).toClick("button", { text: "Continue" });

      await expect(setupPage).toMatch("all done");

      // Clicking 'Finish' closes the page, which removes setupPage as
      // explained above. It's worth testing though to check that the
      // main wallet screen can load properly after setup.

      await expect(setupPage).toClick("button", { text: "Finish" });

      await extensionPopupPage.reload({ waitUntil: "networkidle2" });

      await expect(extensionPopupPage).toMatch("Balances");
    });
  });
});
