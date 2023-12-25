import { MOBILE_CHANNEL_LOGS } from "./constants";
import * as cfg from "./generated-config";
import { isServiceWorker } from "./utils";

export function getLogger(mod: string) {
  if (_LOG_LEVEL === undefined) {
    setupLogLevel();
  }
  return (() => {
    const _mod = mod;
    const prefix = globalThis.___toApp
      ? "hidden-webview:"
      : isServiceWorker()
      ? "service-worker:"
      : "";
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
  if (globalThis.___toApp) {
    _mobileLog(str, ...args);
  } else if (isServiceWorker()) {
    void _serviceWorkerLog(str, ...args);
  } else {
    _log(str, ...args);
  }
}

function _log(str: any, ...args: any) {
  console.log(str, ...args);
}

async function _serviceWorkerLog(...args: any[]) {
  // We're in the serviceworker, try sending the message to the HTML page.
  // @ts-expect-error
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
}

function _mobileLog(...args: any[]) {
  // Disable logs in productions for performance reasons
  if (process.env.NODE_ENV === "production") {
    return;
  }
  // We're inside the hidden webview used by the mobile app, forward the
  // logs to the onMessage handler of the webview component in the app
  globalThis.___toApp({
    channel: MOBILE_CHANNEL_LOGS,
    data: args,
  });
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
