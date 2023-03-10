import type { WalletDescriptor } from "@coral-xyz/common";
import { UI_RPC_METHOD_SIGN_MESSAGE_FOR_PUBLIC_KEY } from "@coral-xyz/common";
import { ethers } from "ethers";

import { useBackgroundClient } from "./";

export const useSignMessageForWallet = (mnemonic?: string | true) => {
  const background = useBackgroundClient();

  const signMessageForWallet = async (
    walletDescriptor: WalletDescriptor,
    message: string
  ) => {
    return await background.request({
      method: UI_RPC_METHOD_SIGN_MESSAGE_FOR_PUBLIC_KEY,
      params: [
        walletDescriptor.blockchain,
        walletDescriptor.publicKey,
        ethers.utils.base58.encode(Buffer.from(message, "utf-8")),
        [mnemonic, [walletDescriptor.derivationPath]],
      ],
    });
  };

  return signMessageForWallet;
};
