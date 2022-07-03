import { mobileStart } from "./mobile";

export * from "./common";
export * from "./extension";
export * from "./mobile";

/**
 * Start the mobile WebView system.
 */
globalThis.chrome
  ? // `global.chrome` exists, we're in chromium.
    globalThis.chrome
  : globalThis.browser
  ? // `global.browser` exists, we're in FF/safari.
    undefined
  : mobileStart();
