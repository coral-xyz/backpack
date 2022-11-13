import {
  ChannelAppUiClient,
  ChannelAppUiResponder,
  UI_RPC_METHOD_KEYRING_STORE_KEEP_ALIVE,
  UI_RPC_METHOD_KEYRING_UPDATE_LAST_USED,
} from "@coral-xyz/common";
import { useEffect } from "react";
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

export function useUpdateLastUsed() {
  const background = useBackgroundClient();
  const updateLastUsed = () => {
    background.request({
      method: UI_RPC_METHOD_KEYRING_UPDATE_LAST_USED,
      params: [],
    });
  };

  useEffect(() => {
    window.addEventListener("keypress", updateLastUsed);
    window.addEventListener("click", updateLastUsed);
    return () => {
      window.removeEventListener("keypress", updateLastUsed);
      window.removeEventListener("click", updateLastUsed);
    };
  });
}
