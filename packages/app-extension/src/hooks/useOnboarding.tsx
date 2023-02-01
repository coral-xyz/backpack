import { useState } from "react";
import type {
  Blockchain,
  SignedWalletDescriptor,
  WalletDescriptor,
} from "@coral-xyz/common";
import {
  getBlockchainFromPath,
  UI_RPC_METHOD_SIGN_MESSAGE_FOR_PUBLIC_KEY,
} from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { ethers } from "ethers";

export const useOnboarding = (mnemonic?: string) => {
  const background = useBackgroundClient();

  const [signedWalletDescriptors, setSignedWalletDescriptors] = useState<
    Array<SignedWalletDescriptor>
  >([]);

  // Add the initialisation parameters for a blockchain keyring to state
  const addSignedWalletDescriptor = (
    signedWalletDescriptor: SignedWalletDescriptor
  ) => {
    setSignedWalletDescriptors([
      ...signedWalletDescriptors,
      signedWalletDescriptor,
    ]);
  };

  const resetSignedWalletDescriptors = () => setSignedWalletDescriptors([]);

  /**
   * Parse the derivation paths of the signed public key paths to determine
   * which blockchains will be onboarded.
   */
  const selectedBlockchains = [
    ...new Set(
      signedWalletDescriptors.map((s) =>
        getBlockchainFromPath(s.derivationPath)
      )
    ),
  ];

  /**
   * Filter a particular blockchain from the signed public key derivation paths.
   */
  const removeBlockchain = (blockchain: Blockchain) => {
    setSignedWalletDescriptors(
      signedWalletDescriptors.filter(
        (s) => getBlockchainFromPath(s.derivationPath) !== blockchain
      )
    );
  };

  const signMessageForWallet = async (
    blockchain: Blockchain,
    walletDescriptor: WalletDescriptor,
    message: string
  ) => {
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

  const keyringInit = {
    mnemonic,
    signedWalletDescriptors,
  };

  return {
    addSignedWalletDescriptor,
    resetSignedWalletDescriptors,
    keyringInit,
    removeBlockchain,
    selectedBlockchains,
    signMessageForWallet,
  };
};
