import { useEffect } from "react";
import { useRecoilValue } from "recoil";
import { ChannelAppUiClient, ChannelAppUiResponder } from "@coral-xyz/common";
import * as atoms from "../atoms";
import { UI_RPC_METHOD_KEYRING_STORE_KEEP_ALIVE } from "@coral-xyz/common";

export function useBackgroundClient(): ChannelAppUiClient {
  return useRecoilValue(atoms.backgroundClient);
}

export function useBackgroundResponder(): ChannelAppUiResponder {
  return useRecoilValue(atoms.backgroundResponder);
}

export function useBackgroundKeepAlive() {
  const bg = useBackgroundClient();
  useEffect(() => {
    setInterval(() => {
      bg.request({
        method: UI_RPC_METHOD_KEYRING_STORE_KEEP_ALIVE,
        params: [],
      });
    }, 5 * 60 * 1000);
  }, []);
}
