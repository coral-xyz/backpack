import { useCallback } from "react";
import type {
  Blockchain,
  LedgerKeyringInit,
  MnemonicKeyringInit,
  PrivateKeyKeyringInit,
} from "@coral-xyz/common";
import { UI_RPC_METHOD_SIGN_MESSAGE_FOR_PUBLIC_KEY } from "@coral-xyz/common";
import { ethers } from "ethers";

import { useBackgroundClient } from "./";

export const useRpcRequests = () => {
  const background = useBackgroundClient();

  const signMessageForWallet = useCallback(
    async (
      blockchain: Blockchain,
      publicKey: string,
      message: string,
      keyringInit?:
        | LedgerKeyringInit
        | MnemonicKeyringInit
        | PrivateKeyKeyringInit
    ) => {
      return await background.request({
        method: UI_RPC_METHOD_SIGN_MESSAGE_FOR_PUBLIC_KEY,
        params: [
          blockchain,
          publicKey,
          ethers.utils.base58.encode(Buffer.from(message, "utf-8")),
          keyringInit,
        ],
      });
    },
    [background]
  );

  return {
    signMessageForWallet,
  };
};
