import expectPuppeteer, {
  setDefaultOptions,
  getDefaultOptions,
} from "expect-puppeteer";
import { generateMnemonic, mnemonicToSeed } from "bip39";
import type { Page } from "puppeteer";
import manifest from "../../build/manifest.json";
import { walletAddressDisplay } from "../components/common";
import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { DerivationPath } from "@200ms/common";
import { deriveKeypairs } from "@200ms/background/dist/esm/keyring/crypto";

let clientPage: Page;
let extensionPopupPage: Page;
let setupPage: Page;

describe("Installing Anchor Wallet", () => {
  // afterAll(async () => {
  //   await extensionPopupPage?.screenshot({ path: "out.png" });
  // });

  // Our test browser has already installed the extension code in ./build
  // see jest-puppeteer.config.js for details about that.
  beforeAll((done) => {
    (async () => {
      clientPage = await browser.newPage();

      await clientPage.goto("http://localhost:3333");

      // Now we need to get the unique ID of the browser extension and
      // then we can open a URL like chrome-extension://EXTENSION_ID/popup.html

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

      const popupFile = manifest.action.default_popup;
      const popupURL = `chrome-extension://${extensionID}/${popupFile}`;
      extensionPopupPage = await browser.newPage();
      await extensionPopupPage.goto(popupURL);

      // extensionPopupPage.setDefaultNavigationTimeout(10_000);
      // setDefaultOptions({ timeout: 15_000 });

      setupPage = await (
        await browser.waitForTarget(
          (target) => target.opener() === extensionPopupPage.target()
        )
      ).page();

      done();
    })();
  });

  // A hacky way to start each test from the same place, because state isn't
  // currently stored between refreshes and there's no router, we can reset
  // the state by reloading the page
  beforeEach((done) => {
    setupPage.reload().then(() => done());
  });

  describe("setting up a new wallet", () => {
    // Click the 'Create wallet' button before each test in this block
    beforeEach((done) => {
      expect(setupPage)
        .toClick("button", { text: "Create" })
        .then(() => done());
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
    beforeEach((done) => {
      expect(setupPage)
        .toClick("button", { text: "Import" })
        .then(() => done());
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
      const connection = new Connection("http://localhost:8899", "confirmed");

      console.log({ getDefaultOptions: getDefaultOptions() });

      const mnemonic = generateMnemonic(256);
      const seed = await mnemonicToSeed(mnemonic);
      const keypairs = deriveKeypairs(seed, DerivationPath.Bip44Change, 2);
      const [firstWallet, secondWallet] = keypairs;
      const sig = await connection.requestAirdrop(
        firstWallet.publicKey,
        1.11 * LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction(sig, "confirmed");

      await expect(setupPage).toFill("input[name=mnemonic]", mnemonic);
      await expect(setupPage).toClick("button", { text: "Continue" });

      await expect(setupPage).toMatch("Your first account will be imported");

      await expect(setupPage).toClick("button", { text: "Continue" });

      await expect(setupPage).toFillForm("form", {
        password: "validpassword",
        "password-confirmation": "validpassword",
      });

      await expect(setupPage).toClick("button", { text: "Continue" });

      await expect(setupPage).toMatch("all done");

      await run(() => expect(setupPage).toClick("button", { text: "Finish" }));

      await extensionPopupPage.reload({ waitUntil: "networkidle2" });

      // Check that we can unlock the wallet with the password we just used
      await expect(extensionPopupPage).toFill(
        "input[type=password]",
        "validpassword"
      );

      await expect(extensionPopupPage).toClick("button", { text: "Unlock" });

      console.log({
        mnemonic,
        keypairs: keypairs.map((k) => k.publicKey.toString()),
      });

      // console.log("0");

      await run(() =>
        extensionPopupPage.waitForSelector("#menu-button", {
          visible: true,
        })
      );

      await run(() =>
        expectPuppeteer(extensionPopupPage).toClick("#menu-button")
      );

      // console.log("A");

      await run(() =>
        expect(extensionPopupPage).toMatch(
          walletAddressDisplay(firstWallet.publicKey)
        )
      );

      // console.log("B");

      await run(() =>
        expectPuppeteer(extensionPopupPage).toClick("p", {
          text: "Connection",
        })
      );

      // console.log("C");

      // console.log(await extensionPopupPage.content());

      await run(() =>
        expectPuppeteer(extensionPopupPage).toClick("span", {
          text: "Localnet",
        })
      );

      // console.log("D");
      await run(() =>
        extensionPopupPage.waitForSelector("#drawer", { hidden: true })
      );

      await run(() =>
        expectPuppeteer(extensionPopupPage).toClick("p", {
          text: "1.11 SOL",
        })
      );

      // await extensionPopupPage.waitForSelector("#drawer");

      // console.log("E");

      await run(() =>
        expectPuppeteer(extensionPopupPage).toClick("button", {
          text: "Send",
        })
      );
      // console.log("f");

      await run(() =>
        expect(extensionPopupPage).toFillForm("form", {
          to: secondWallet.publicKey.toString(),
          amount: "0.5",
        })
      );
      // console.log("g");

      await run(() =>
        expect(extensionPopupPage).toClick("[data-testid='Send']")
      );

      await run(() =>
        expect(extensionPopupPage).toClick("button", {
          text: "Confirm",
        })
      );

      // console.log("h");

      await run(() => expectPuppeteer(extensionPopupPage).toMatch("Sent!"));

      // console.log("i");
      await run(() =>
        expect(extensionPopupPage).toClick("button", {
          text: "Close",
        })
      );

      // console.log("j");

      await run(() =>
        expect(extensionPopupPage).toClick("[data-testid='back-button']")
      );

      // console.log("k");

      await run(() =>
        expectPuppeteer(extensionPopupPage).toClick("#menu-button")
      );
      // console.log("l");

      await run(() =>
        extensionPopupPage.waitForSelector("#drawer", { visible: true })
      );

      await run(() =>
        expectPuppeteer(extensionPopupPage).toClick("p", {
          text: "Add / Connect Wallet",
        })
      );
      // console.log("m");

      await run(() =>
        expectPuppeteer(extensionPopupPage).toClick("p", {
          text: "Create a new wallet",
        })
      );
      // console.log("n");

      await run(() =>
        expectPuppeteer(extensionPopupPage).toClick("#menu-button")
      );

      // console.log("o");

      await run(() =>
        expect(extensionPopupPage).toMatch(
          walletAddressDisplay(secondWallet.publicKey)
        )
      );

      // console.log("p");

      // check balances directly because UI doesn't update immediately, change
      // once https://github.com/200ms-labs/anchor-wallet/issues/111 is fixed

      const [firstBalance, secondBalance] = await Promise.all([
        connection.getBalance(firstWallet.publicKey),
        connection.getBalance(secondWallet.publicKey),
      ]);
      console.log({ firstBalance, secondBalance });

      expect(firstBalance).toEqual(609_995_000);

      expect(secondBalance).toEqual(500_000_000);

      await extensionPopupPage.close();

      // console.log("closed");

      await clientPage.bringToFront();

      // console.log("brought to front");
      await run(() =>
        expect(clientPage).toClick("button", {
          text: "Select Wallet",
        })
      );

      // console.log("clicked select wallet");
      await run(() =>
        expect(clientPage).toClick("button", {
          text: "Anchor",
        })
      );

      // console.log("chose anchor");

      await sleep(1000);

      const browserPages = await browser.pages();
      const approvePopup = browserPages[browserPages.length - 1];

      await expect(approvePopup).toMatch("Connect Wallet to localhost");
      await expect(approvePopup).toClick("button", { text: "Approve" });

      // console.log("opened and approved wallet connection");

      // Wallet is now connected
      await run(() =>
        expect(clientPage).toClick("button", {
          text: "Disconnect",
        })
      );

      // Wallet is now disconnected, expect to see 'Select Wallet' button
      await run(() => expect(clientPage).toMatch("Select Wallet"));

      // console.log("reset ui");
    }, 60_000 /** allow 60s for test to run due to loading external data */);
  });
});

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

const run = (op: any) =>
  new Promise(async (res, rej) => {
    await sleep(1000);
    try {
      await op();
    } catch (err) {
      await sleep(3000);
      try {
        await op();
      } catch (err) {
        rej(err);
      }
    }
    res(null);
  });
