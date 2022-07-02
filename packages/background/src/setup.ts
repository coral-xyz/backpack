(async function setup() {
  try {
    // console.log(new URL("./service-worker.ts", import.meta.url));
    const registration = await navigator.serviceWorker.register(
      new URL("./service-worker.ts", import.meta.url),
      {
        type: "module",
      }
    );

    navigator.serviceWorker.onmessage = (event: any) => {
      switch (event.channel) {
        case "mobile-logs":
          handleForwardLogs(event);
          break;
        case "mobile-response":
          handleResponse(event);
          break;
        default:
        //throw new Error(event);
      }
    };

    const handleForwardLogs = (event) => {
      // @ts-ignore
      window.ReactNativeWebView?.postMessage(JSON.stringify(event.data));
    };
    const handleResponse = (event) => {
      //			armaniHandleResponse(event);
    };

    // @ts-ignore
    window.forwardLogs = (event) => handleForwardLogs({ data: event });

    // @ts-ignore
    window.postMessageToBackgroundViaWebview = (rawData) => {
      // @ts-ignore
      navigator.serviceWorker.controller.postMessage(rawData);
    };

    // @ts-ignore
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
