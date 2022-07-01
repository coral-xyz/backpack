import { armaniHandleResponse } from "@coral-xyz/common";

(async function setup() {
  try {
    // console.log(new URL("./service-worker.ts", import.meta.url));
    const registration = await navigator.serviceWorker.register(
      new URL("./service-worker.ts", import.meta.url),
      {
        type: "module",
      }
    );

    navigator.serviceWorker.onmessage = (event) => {
      switch (event.channel) {
        case "mobile-logs":
          handleForwardLogs(event);
          break;
        case "mobile-response":
          handleResponse(event);
          break;
        default:
          throw new Error(event);
      }
    };

    const handleForwardLogs = (event) => {
      window.ReactNativeWebView?.postMessage(JSON.stringify(event.data));
    };
    window.forwardLogs = (event) => handleForwardLogs({ data: event });

    const handleResponse = (event) => {
      //			armaniHandleResponse(event);
    };

    window.postMessageToBackgroundViaWebview = (rawData) => {
      navigator.serviceWorker.controller.postMessage(rawData);
    };

    document
      .querySelector("body")
      .insertAdjacentHTML(
        "beforeend",
        "<p>background script service worker registered</p>"
      );
  } catch (err) {
    document.write(JSON.stringify({ err }));
  }
})();
