require("isomorphic-fetch");
const { setDefaultOptions } = require("expect-puppeteer");
const { webcrypto } = require("crypto");

globalThis.crypto = webcrypto;

// big timeout for external requests to do their thing
setDefaultOptions({ timeout: 60_000 });
