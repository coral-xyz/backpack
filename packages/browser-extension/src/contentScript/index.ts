import {
  log,
  Channel,
  BrowserRuntime,
  CHANNEL_RPC_REQUEST,
  CHANNEL_RPC_RESPONSE,
  CHANNEL_NOTIFICATION,
} from "../common";

// Script entry.
function main() {
  log("starting content script");
  injectScript("injected.js");
  log("provider injected");
  log("creating content channel");
  initChannels();
  log("content channel created");
}

// Inserts a <script> tag into the DOM.
function injectScript(scriptName: string) {
  try {
    const container = document.head || document.documentElement;
    const scriptTag = document.createElement("script");
    scriptTag.setAttribute("async", "false");
    scriptTag.src = BrowserRuntime.getUrl(scriptName);
    container.insertBefore(scriptTag, container.children[0]);
    container.removeChild(scriptTag);
  } catch (error) {
    console.error("provider injection failed.", error);
  }
}

function initChannels() {
  initClientChannels();
  initBackgroundChannels();
}

// Initialize all communication channels from the client to the background
// script.
function initClientChannels() {
  // Forward all rpc requests from the injceted script to the background page.
  Channel.proxy(CHANNEL_RPC_REQUEST, CHANNEL_RPC_RESPONSE);
}

// Initialize all communication channels from the background script to the
// client.
function initBackgroundChannels() {
  // Forward all notifications from the background script to the injected page.
  Channel.proxyReverse(CHANNEL_NOTIFICATION);
}

main();
