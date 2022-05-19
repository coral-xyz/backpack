const setDefaultOptions = require("expect-puppeteer").setDefaultOptions;

// big timeout for external requests to do their thing
setDefaultOptions({ timeout: 60_000 });
