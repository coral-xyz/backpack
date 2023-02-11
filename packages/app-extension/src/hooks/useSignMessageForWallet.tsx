import type { WalletDescriptor } from "@coral-xyz/common";
import {
  getBlockchainFromPath,
  UI_RPC_METHOD_SIGN_MESSAGE_FOR_PUBLIC_KEY,
} from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { ethers } from "ethers";

export const useSignMessageForWallet = (mnemonic?: string | true) => {
  const background = useBackgroundClient();

  const signMessageForWallet = async (
    walletDescriptor: WalletDescriptor,
    message: string
  ) => {
    const blockchain = getBlockchainFromPath(walletDescriptor.derivationPath);
    return await background.request({
      method: UI_RPC_METHOD_SIGN_MESSAGE_FOR_PUBLIC_KEY,
      params: [
        blockchain,
        walletDescriptor.publicKey,
        ethers.utils.base58.encode(Buffer.from(message, "utf-8")),
        [mnemonic, [walletDescriptor.derivationPath]],
      ],
    });
  };

  return signMessageForWallet;
};
