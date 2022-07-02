import { atom } from "recoil";
import {
  ChannelAppUi,
  ChannelAppUiClient,
  CONNECTION_POPUP_RPC,
  CONNECTION_POPUP_RESPONSE,
} from "@coral-xyz/common";

export const backgroundClient = atom<ChannelAppUiClient>({
  key: "backgroundClient",
  default: ChannelAppUi.client(CONNECTION_POPUP_RPC),
});

export const backgroundResponseClient = atom<ChannelAppUiClient>({
  key: "backgroundResponseClient",
  default: ChannelAppUi.client(CONNECTION_POPUP_RESPONSE),
});
