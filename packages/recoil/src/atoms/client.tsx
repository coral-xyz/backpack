import type {
  ChannelAppUiClient,
  ChannelAppUiResponder,
} from "@coral-xyz/common";
import {
  CHANNEL_ETHEREUM_CONNECTION_RPC_UI,
  CHANNEL_POPUP_RESPONSE,
  CHANNEL_POPUP_RPC,
  CHANNEL_SOLANA_CONNECTION_RPC_UI,
  ChannelAppUi,
} from "@coral-xyz/common";
import { atom, selector } from "recoil";

/**
 * Allows the app ui to send requests to the background script.
 * This is the primary way the UI communicates with the background.
 */
export const backgroundClient = atom<ChannelAppUiClient>({
  key: "backgroundClient",
  default: ChannelAppUi.client(CHANNEL_POPUP_RPC),
});

/**
 * Allows the app ui to respond to requests to the background script.
 * This only happens when a third party web app requests permission
 * from the app for something.
 */
export const backgroundResponder = atom<ChannelAppUiResponder>({
  key: "backgroundResponseClient",
  default: ChannelAppUi.responder(CHANNEL_POPUP_RESPONSE),
});

/**
 * Channel for proxying Solana Connection requests to be fulfilled by
 * the background.
 */
export const connectionBackgroundClient = selector({
  key: "connectionBackgroundClient",
  get: () => {
    return ChannelAppUi.client(CHANNEL_SOLANA_CONNECTION_RPC_UI);
  },
});

/**
 * Channel for proxying Ethereum provider requests to be fulfilled by
 * the background.
 */
export const providerBackgroundClient = selector({
  key: "providerBackgroundClient",
  get: () => {
    return ChannelAppUi.client(CHANNEL_ETHEREUM_CONNECTION_RPC_UI);
  },
});
