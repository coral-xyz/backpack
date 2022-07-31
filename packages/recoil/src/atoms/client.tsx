import { atom } from "recoil";
import {
  ChannelAppUi,
  ChannelAppUiClient,
  ChannelAppUiResponder,
  CONNECTION_POPUP_RPC,
  CONNECTION_POPUP_RESPONSE,
} from "@coral-xyz/common";

//
// Allows the app ui to send requests to the background script.
// This is the primary way the UI communicates with the background.
//
export const backgroundClient = atom<ChannelAppUiClient>({
  key: "backgroundClient",
  default: ChannelAppUi.client(CONNECTION_POPUP_RPC),
});

//
// Allows the app ui to respond to requests to the background script.
// This only happens when a third party web app requests permission
// from the app for something.
//
export const backgroundResponder = atom<ChannelAppUiResponder>({
  key: "backgroundResponseClient",
  default: ChannelAppUi.responder(CONNECTION_POPUP_RESPONSE),
});
