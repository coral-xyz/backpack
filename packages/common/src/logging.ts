import { vanillaStore } from "./zustand-store";
import { isServiceWorker, IS_MOBILE } from "./utils";
import { MOBILE_CHANNEL_LOGS } from "./constants";

export function getLogger(mod: string) {
  return (() => {
    const _mod = mod;
    const prefix = isServiceWorker() ? "service-worker:" : "";
    return {
      debug: (str: string, ...args: any) =>
        debug(`${prefix}anchor: ${_mod}: ${str}`, ...args),
      error: (str: string, ...args: any) =>
        error(`${prefix}anchor: ${_mod}: ${str}`, ...args),
      _log,
    };
  })();
}

function debug(str: any, ...args: any) {
  log(str, ...args);
}

function error(str: any, ...args: any) {
  log(`ERROR: ${str}`, ...args);
}

function log(str: any, ...args: any) {
  if (IS_MOBILE) {
    _mobileLog(str, ...args);
  } else {
    _log(str, ...args);
  }
}

function _log(str: any, ...args: any) {
  console.log(str, ...args);
}

/**
 * Temporary logging helper function specifically for the mobile app
 *
 * An alternative to console.log which should ensure that your logs are
 * visible in the terminal, regardless of whether you are in a webview,
 * serviceworker or react native app.
 * @param args what to log
 */
async function _mobileLog(...args: any[]) {
  // We're in the serviceworker, try sending the message to the HTML page.
  try {
    const clients = await self.clients.matchAll({
      includeUncontrolled: true,
      type: "window",
    });

    clients.forEach((client) => {
      client.postMessage({
        channel: MOBILE_CHANNEL_LOGS,
        data: args,
      });
    });
  } catch (err) {
    // Although we're already in the frontend code here, send the log back
    // to the webview so that we can log through the mobile subsystem.
    //
    vanillaStore.getState()?.injectJavaScript?.(
      `navigator.serviceWorker.onmessage(${JSON.stringify({
        data: {
          channel: MOBILE_CHANNEL_LOGS,
          data: args,
        },
      })}); true;`
    );
  }
}
