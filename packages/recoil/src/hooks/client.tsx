import { useEffect } from "react";
import type {
  ChannelAppUiClient,
  ChannelAppUiResponder,
} from "@coral-xyz/common";
import { useRecoilValue } from "recoil";

import { backgroundClient, backgroundResponder } from "../atoms";

export function useBackgroundClient(): ChannelAppUiClient {
  return useRecoilValue(backgroundClient);
}

export function useBackgroundResponder(): ChannelAppUiResponder {
  return useRecoilValue(backgroundResponder);
}
