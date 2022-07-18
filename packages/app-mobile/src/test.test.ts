import { remote } from "webdriverio";

jest.setTimeout(30000);

type AsyncReturnType<T extends (...args: any) => Promise<any>> = T extends (
  ...args: any
) => Promise<infer R>
  ? R
  : any;

let client: AsyncReturnType<typeof remote>;

const EXPO_URL = "exp://127.0.0.1:19000";

async function reloadExpo() {
  await client.shake();
  const reloadSelector =
    "type == 'XCUIElementTypeOther' && name CONTAINS 'Reload'";
  await tapOn(`-ios predicate string:${reloadSelector}`);
}

beforeAll(async () => {
  client = await remote({
    path: "/wd/hub",
    port: 4723,
    capabilities: {
      platformName: "iOS",
      deviceName: "iPhone 11",
      platformVersion: "15.5",
    },
  });
  // Reload app between every test
  await client.url(EXPO_URL);
  // This timeout applies when searching for elements with $('')
  await client.setTimeout({ implicit: 10000 });
});

beforeEach(async () => {
  await reloadExpo();
  await client.pause(100);
});

afterAll(async () => {
  if (client) {
    await client.deleteSession();
  }
});

test("Creating a new wallet", async () => {
  await find("~BackpackLogo");
  await tapOn("~CreateANewWallet");

  await fillIn("~Password", "test1234");
  await fillIn("~ConfirmPassword", "test1234");

  await tapOn("~IAgreeToTheTerms");
  await tapOn("~Next");

  await tapOn("~Continue");

  await fillIn("~Password", "test1234");
  await tapOn("~Unlock");

  await tapOn("~Lock");

  await find("~Password");
});

test("Import an existing wallet", async () => {
  await find("~BackpackLogo");
  await tapOn("~ImportAnExistingWallet");

  await fillIn(
    "~RecoveryPhrase",
    "imitate chaos mountain warrior heart city" +
      " cigar isolate enact another horse top"
  );
  await tapOn("~Import");

  await fillIn("~Password", "test1234");
  await fillIn("~ConfirmPassword", "test1234");

  await tapOn("~IAgreeToTheTerms");
  await tapOn("~Next");

  await tapOn("~Continue");

  await fillIn("~Password", "test1234");
  await tapOn("~Unlock");

  await tapOn("~Lock");

  await find("~Password");
});

async function find(elementSelector: string) {
  await client.pause(100);
  const element = await client.$(elementSelector);
  await element.waitForExist();
  return element;
}

async function tapOn(elementSelector: string) {
  await client.pause(100);
  const element = await find(elementSelector);
  return element.click();
}

async function fillIn(elementSelector: string, value: string) {
  await client.pause(100);
  const element = await find(elementSelector);
  await element.setValue(value);
}
