import {
  BrowserRuntimeExtension,
  CHANNEL_ETHEREUM_CONNECTION_INJECTED_REQUEST,
  CHANNEL_ETHEREUM_CONNECTION_INJECTED_RESPONSE,
  CHANNEL_ETHEREUM_NOTIFICATION,
  CHANNEL_ETHEREUM_RPC_REQUEST,
  CHANNEL_ETHEREUM_RPC_RESPONSE,
  CHANNEL_SECURE_BACKGROUND_NOTIFICATION,
  CHANNEL_SECURE_BACKGROUND_REQUEST,
  CHANNEL_SECURE_BACKGROUND_RESPONSE,
  CHANNEL_SOLANA_CONNECTION_INJECTED_REQUEST,
  CHANNEL_SOLANA_CONNECTION_INJECTED_RESPONSE,
  CHANNEL_SOLANA_NOTIFICATION,
  CHANNEL_SOLANA_RPC_REQUEST,
  CHANNEL_SOLANA_RPC_RESPONSE,
  ChannelContentScript,
  getLogger,
} from "@coral-xyz/common";

const logger = getLogger("content-script");

// Script entry -> non blocking to speed up extension loading?
// setTimeout(()=>main(), 100);
main();

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
  // Secure Background service specific rpc requests.
  //
  ChannelContentScript.proxy(
    CHANNEL_SECURE_BACKGROUND_REQUEST,
    CHANNEL_SECURE_BACKGROUND_RESPONSE
  );
  //
  // Wallet Solana specific rpc requests.
  //
  ChannelContentScript.proxy(
    CHANNEL_SOLANA_RPC_REQUEST,
    CHANNEL_SOLANA_RPC_RESPONSE
  );
  //
  // Wallet Ethereum specific rpc requests.
  //
  ChannelContentScript.proxy(
    CHANNEL_ETHEREUM_RPC_REQUEST,
    CHANNEL_ETHEREUM_RPC_RESPONSE
  );
  //
  // Solana Connection forwarding.
  //
  ChannelContentScript.proxy(
    CHANNEL_SOLANA_CONNECTION_INJECTED_REQUEST,
    CHANNEL_SOLANA_CONNECTION_INJECTED_RESPONSE
  );
  //
  // Ethereum Provider forwarding.
  //
  ChannelContentScript.proxy(
    CHANNEL_ETHEREUM_CONNECTION_INJECTED_REQUEST,
    CHANNEL_ETHEREUM_CONNECTION_INJECTED_RESPONSE
  );
}

// Initialize all communication channels from the background script to the
// client.
function initBackgroundChannels() {
  // Forward all notifications from the background script to the injected page.
  ChannelContentScript.proxyReverse(CHANNEL_ETHEREUM_NOTIFICATION);
  ChannelContentScript.proxyReverse(CHANNEL_SOLANA_NOTIFICATION);
  ChannelContentScript.proxyReverse(CHANNEL_SECURE_BACKGROUND_NOTIFICATION);
}
