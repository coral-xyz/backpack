import { useEffect } from "react";
import type {
  ChannelAppUiClient,
  ChannelAppUiResponder,
} from "@coral-xyz/common";
import { UI_RPC_METHOD_KEYRING_STORE_KEEP_ALIVE } from "@coral-xyz/common";
import { useRecoilValue } from "recoil";

import { backgroundClient, backgroundResponder } from "../atoms";

export function useBackgroundClient(): ChannelAppUiClient {
  return useRecoilValue(backgroundClient);
}

export function useBackgroundResponder(): ChannelAppUiResponder {
  return useRecoilValue(backgroundResponder);
}

export function useBackgroundKeepAlive() {
  const bg = useBackgroundClient();
  useEffect(() => {
    const interval = setInterval(() => {
      bg.request({
        method: UI_RPC_METHOD_KEYRING_STORE_KEEP_ALIVE,
        params: [],
      });
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
}
