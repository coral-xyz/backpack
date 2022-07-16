// directory that contains output of `yarn build`
const BUILD_OUTPUT_DIR = "./build";

// approx width/height of the browser extension popup
const [width, height] = [380, 600];

// hardcoded the default installation path of Google Chrome
// on macOS for now, if you want to use a different browser or OS
// then set PUPPETEER_EXEC_PATH. This is what GitHub actions does
const executablePath =
  process.env.PUPPETEER_EXEC_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

module.exports = {
  server: [
    {
      command: "solana-test-validator",
    },
    {
      command: "serve -p 3333 ../../examples/clients/simple/dist",
    },
  ],
  launch: {
    headless: false,
    executablePath,
    // slowMo adds a delay between each event such as a keystroke,
    // it's set to 0ms by default for speed but you can increase it
    // to make tests more human-like
    slowMo: Number(process.env.SLOWMO || 0),
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      `--disable-extensions-except=${BUILD_OUTPUT_DIR}`,
      `--load-extension=${BUILD_OUTPUT_DIR}`,
      "--disable-infobars",
      "--hide-scrollbars",
      // add 150px to height to account for menus and toolbar
      `--window-size=${width},${height + 150}`,
      // memory optimizations below
      "--disable-dev-shm-usage",
      "--disable-features=AudioServiceOutOfProcess",
      "--disable-gpu",
      "--disable-software-rasterizer",
      "--no-first-run",
      "--no-zygote",
    ],
    defaultViewport: {
      width,
      height,
    },
  },
};
