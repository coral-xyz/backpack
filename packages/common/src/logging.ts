import { MOBILE_CHANNEL_LOGS } from "./constants";
import * as cfg from "./generated-config";
import { IS_MOBILE, isServiceWorker } from "./utils";
import { useStore } from "./zustand-store";

export function getLogger(mod: string) {
  if (_LOG_LEVEL === undefined) {
    setupLogLevel();
  }
  return (() => {
    const _mod = mod;
    const prefix = isServiceWorker() ? "service-worker:" : "";
    return {
      debug: (str: string, ...args: any) =>
        debug(`backpack:${prefix} ${_mod}: ${str}`, ...args),
      error: (str: string, ...args: any) =>
        error(`backpack:${prefix} ${_mod}: ${str}`, ...args),
      _log,
    };
  })();
}

function debug(str: any, ...args: any) {
  if (_LOG_LEVEL <= LogLevel.Debug) {
    log(str, ...args);
  }
}

function error(str: any, ...args: any) {
  if (_LOG_LEVEL <= LogLevel.Error) {
    log(`ERROR: ${str}`, ...args);
  }
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
    // @ts-ignore
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
    useStore.getState()?.injectJavaScript?.(
      `navigator.serviceWorker.onmessage(${JSON.stringify({
        data: {
          channel: MOBILE_CHANNEL_LOGS,
          data: args,
        },
      })}); true;`
    );
  }
}

let _LOG_LEVEL: LogLevel;
export enum LogLevel {
  Trace,
  Debug,
  Info,
  Warning,
  Error,
}

export function setupLogLevel() {
  _LOG_LEVEL = (() => {
    switch (cfg.BACKPACK_CONFIG_LOG_LEVEL) {
      case "trace":
        return LogLevel.Trace;
      case "debug":
        return LogLevel.Debug;
      case "info":
        return LogLevel.Info;
      case "warning":
        return LogLevel.Warning;
      case "error":
        return LogLevel.Error;
      default:
        throw new Error("invalid log level");
    }
  })();
}
