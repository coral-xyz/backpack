import { useEffect } from "react";
import { UI_RPC_METHOD_KEYRING_STORE_KEEP_ALIVE } from "@coral-xyz/common";
import { useBackgroundClient } from "./useBackgroundClient";

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
