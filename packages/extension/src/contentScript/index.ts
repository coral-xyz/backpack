import {
  getLogger,
  ChannelContentScript,
  BrowserRuntimeExtension,
  CHANNEL_RPC_REQUEST,
  CHANNEL_RPC_RESPONSE,
  CHANNEL_NOTIFICATION,
  CHANNEL_SOLANA_CONNECTION_INJECTED_REQUEST,
  CHANNEL_SOLANA_CONNECTION_INJECTED_RESPONSE,
} from "@coral-xyz/common";

const logger = getLogger("content-script");

// Script entry.
function main() {
  logger.debug("starting content script");
  injectScript("injected.js");
  logger.debug("provider injected");
  logger.debug("creating content channel");
  initChannels();
  logger.debug("content channel created");
}

// Inserts a <script> tag into the DOM.
function injectScript(scriptName: string) {
  try {
    const container = document.head || document.documentElement;
    const scriptTag = document.createElement("script");
    scriptTag.setAttribute("async", "false");
    scriptTag.src = BrowserRuntimeExtension.getUrl(scriptName);
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

// Initialize all proxy communication channels from the client to the background
// script.
function initClientChannels() {
  //
  // Wallet specific rpc requests.
  //
  ChannelContentScript.proxy(CHANNEL_RPC_REQUEST, CHANNEL_RPC_RESPONSE);
  //
  // Solana Connection forwarding.
  //
  ChannelContentScript.proxy(
    CHANNEL_SOLANA_CONNECTION_INJECTED_REQUEST,
    CHANNEL_SOLANA_CONNECTION_INJECTED_RESPONSE
  );
}

// Initialize all communication channels from the background script to the
// client.
function initBackgroundChannels() {
  // Forward all notifications from the background script to the injected page.
  ChannelContentScript.proxyReverse(CHANNEL_NOTIFICATION);
}

main();
