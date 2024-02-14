export function getEnv():
  | "extension-app"
  | "extension-sw"
  | "mobile-app"
  | "mobile-hidden-webview"
  | "mobile-injected-provider"
  | "web-injected-provider"
  | "unknown" {
  const evaluatePlatform = () => {
    if (isExtensionApp()) {
      return "extension-app";
    }

    if (isExtensionServiceWorker()) {
      return "extension-sw";
    }

    if (isMobileNonServiceWorkerWebView()) {
      return "mobile-hidden-webview";
    }

    if (isMobileInjectedProvider()) {
      return "mobile-injected-provider";
    }

    if (isMobileApp()) {
      return "mobile-app";
    }

    if (isWebInjectedProvider()) {
      return "web-injected-provider";
    }

    // this runs on every website before web-injection runs in which case this is unknown
    // console.error(
    //   "Invalid ENV: If you run into this error, add a case and fix it!"
    // );
    return "unknown";
  };
  const platform = evaluatePlatform();
  // console.log("PLATFORM", platform)
  return platform;
}

function isExtensionApp(): boolean {
  const status = _serviceWorkerCheck();
  return status === "app";
}

function isExtensionServiceWorker(): boolean {
  const status = _serviceWorkerCheck();
  return status === "service-worker";
}

function _serviceWorkerCheck(): "service-worker" | "app" | "not-supported" {
  if (typeof chrome !== "undefined" && chrome.runtime) {
    if (
      typeof self !== "undefined" &&
      globalThis.clients &&
      globalThis.clients.matchAll
    ) {
      return "service-worker";
    }

    return "app";
  }

  return "not-supported";
}

function isWebInjectedProvider(): boolean {
  // window & window.document aren't available in React Native
  // @ts-ignore
  if (
    !(typeof window !== "undefined" && typeof window.document !== "undefined")
  ) {
    return false;
  }

  if (!globalThis._backpack_injected_provider) {
    return false;
  }

  if (isMobileInjectedProvider()) {
    return false;
  }

  return true;
}

function isMobileApp(): boolean {
  // window & window.document aren't available in React Native
  if (typeof window !== "undefined" && typeof window.document !== "undefined") {
    return false;
  }

  return true;
}

function isMobileNonServiceWorkerWebView(): boolean {
  return (
    globalThis.isHiddenWebView && !globalThis.chrome && !globalThis.browser
  );
}

function isMobileInjectedProvider(): boolean {
  return globalThis.isMobileInjectedProvider;
}
