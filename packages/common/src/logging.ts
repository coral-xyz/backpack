import { vanillaStore } from "./zustand";

function log(str: any, ...args: any) {
  console.log(`anchor: ${str}`, ...args);
}

function debug(str: any, ...args: any) {
  log(str, ...args);
}

function error(str: any, ...args: any) {
  console.error(`${str}`, ...args);
}

export function getLogger(mod: string) {
  return (() => {
    const _mod = mod;
    return {
      debug: (str: string, ...args: any) => debug(`${_mod}: ${str}`, ...args),
      error: (str: string, ...args: any) => error(`${_mod}: ${str}`, ...args),
    };
  })();
}

/**
 * Temporary logging helper function specifically for the mobile app
 *
 * An alternative to console.log which should ensure that your logs are
 * visible in the terminal, regardless of whether you are in a webview,
 * serviceworker or react native app.
 * @param args what to log
 */
export async function logFromAnywhere(...args: any[]) {
  // Assumes your're in the service worker.
  try {
    // if we're in a serviceworker, try sending the message to the HTML page
    const clients = await self.clients.matchAll({
      includeUncontrolled: true,
      type: "window",
    });

    clients.forEach((client) => {
      client.postMessage({
        channel: "mobile-logs",
        data: {
          args,
          from: "serviceWorker",
        },
      });
    });
  } catch (err) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      vanillaStore.getState().injectJavaScript!(
        `window.forwardLogs(${JSON.stringify({
          args,
          from: "frontend",
        })}); true;`
      );
    } catch (err) {
      console.log({ args, from: "idk" });
    }
    /*
	// Assumes you're in the frontend.
	catch (err) {
		console.log({ args, from: 'frontend' });
  }
		*/
  }
}
