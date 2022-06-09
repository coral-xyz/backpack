require("isomorphic-fetch");
const setDefaultOptions = require("expect-puppeteer").setDefaultOptions;
const crypto = require("crypto").webcrypto;

globalThis.crypto = crypto;

// big timeout for external requests to do their thing
setDefaultOptions({ timeout: 60_000 });
