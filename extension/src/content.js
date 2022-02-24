const CHANNEL_INJECTED_REQUEST = "anchor-injected-request";
const CHANNEL_CONTENT_REQUEST = "anchor-content-request";
const CHANNEL_CONTENT_RESPONSE = "anchor-content-response";

// Script entry.
function main() {
  log("injecting provider");
  injectScript("injected.js");
  log("provider injected");
  log("creating content channel");
  initChannels();
  log("content channel created");
}

// Inserts a <script> tag into the DOM.
function injectScript(scriptName) {
  try {
    const container = document.head || document.documentElement;
    const scriptTag = document.createElement("script");
    scriptTag.setAttribute("async", "false");
    scriptTag.src = chrome.runtime.getURL(scriptName);
    container.insertBefore(scriptTag, container.children[0]);
    container.removeChild(scriptTag);
  } catch (error) {
    error("anchor-content: Provider injection failed.", error);
  }
}

function initChannels() {
  window.addEventListener(CHANNEL_INJECTED_REQUEST, (event) => {
    const { method, params } = event.detail;
    chrome.runtime.sendMessage(
      {
        channel: CHANNEL_CONTENT_REQUEST,
        data: event.detail,
      },
      (response) => {
        if (!response) {
          return;
        }
        window.dispatchEvent(
          new CustomEvent(CHANNEL_CONTENT_RESPONSE, { detail: response })
        );
      }
    );
  });
}

function log(str, ...args) {
  console.log(`anchor-content: ${str}`, ...args);
}

function error(str, ...args) {
  console.error(`anchor-content: ${str}`, ...args);
}

main();
