export let useBackpackDevTools: typeof import("./useBackpackDevTools").useBackpackDevTools;

// @ts-ignore process.env.NODE_ENV is defined by metro transform plugins
if (process.env.NODE_ENV !== "production") {
  useBackpackDevTools = require("./useBackpackDevTools").useBackpackDevTools;
} else {
  useBackpackDevTools = () => ({
    log: () => { },
  });
}
