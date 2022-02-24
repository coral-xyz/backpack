const CHANNEL_INJECTED = "anchor-injected";
const CHANNEL_CONTENT = "anchor-content";

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
  window.addEventListener(CHANNEL_INJECTED, (event) => {
    const { method, params } = event.detail;
    chrome.runtime.sendMessage(
      {
        channel: CHANNEL_CONTENT,
        data: event.detail,
      },
      (response) => {
        if (!response) {
          return;
        }
        window.dispatchEvent(
          new CustomEvent(CHANNEL_CONTENT, { detail: response })
        );
      }
    );
  });
}

function log(str) {
  console.log(`anchor-content: ${str}`);
}

function error(str) {
  console.error(`anchor-content: ${str}`);
}

main();
