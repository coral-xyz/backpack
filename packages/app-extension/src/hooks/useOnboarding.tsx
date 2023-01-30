import { useState } from "react";
import type {
  Blockchain,
  PublicKeyPath,
  SignedPublicKeyPath,
} from "@coral-xyz/common";
import { UI_RPC_METHOD_SIGN_MESSAGE_FOR_PUBLIC_KEY } from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { ethers } from "ethers";

export const useOnboarding = (mnemonic?: string) => {
  const background = useBackgroundClient();

  const [signedPublicKeyPaths, setSignedPublicKeyPaths] = useState<
    Array<SignedPublicKeyPath>
  >([]);

  // Add the initialisation parameters for a blockchain keyring to state
  const addPublicKeyPath = async (signedPublicKeyPath: SignedPublicKeyPath) => {
    setSignedPublicKeyPaths([...signedPublicKeyPaths, signedPublicKeyPath]);
  };

  const signMessageForWallet = async (
    publicKeyPath: PublicKeyPath,
    message: string
  ) => {
    return await background.request({
      method: UI_RPC_METHOD_SIGN_MESSAGE_FOR_PUBLIC_KEY,
      params: [
        publicKeyPath.blockchain,
        publicKeyPath.publicKey,
        ethers.utils.base58.encode(Buffer.from(message, "utf-8")),
        [mnemonic, [publicKeyPath.derivationPath]],
      ],
    });
  };

  const keyringInit = {
    mnemonic,
    signedPublicKeyPaths,
  };

  const selectedBlockchains = [
    ...new Set(signedPublicKeyPaths.map((s) => s.blockchain)),
  ];

  const removeBlockchain = (blockchain: Blockchain) => {
    setSignedPublicKeyPaths(
      signedPublicKeyPaths.filter((s) => s.blockchain !== blockchain)
    );
  };

  const resetPublicKeyPaths = () => setSignedPublicKeyPaths([]);

  return {
    addPublicKeyPath,
    keyringInit,
    removeBlockchain,
    resetPublicKeyPaths,
    selectedBlockchains,
    signMessageForWallet,
  };
};
