import { useState } from "react";
import type {
  Blockchain,
  PublicKeyPath,
  SignedPublicKeyPath,
} from "@coral-xyz/common";
import {
  getCreateMessage,
  UI_RPC_METHOD_PREVIEW_PUBKEYS,
  UI_RPC_METHOD_SIGN_MESSAGE_FOR_PUBLIC_KEY,
} from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { ethers } from "ethers";

export const useOnboarding = (mnemonic?: string) => {
  const background = useBackgroundClient();

  const [signedPublicKeyPaths, setSignedPublicKeyPaths] = useState<
    Array<SignedPublicKeyPath>
  >([]);

  // Add the initialisation parameters for a blockchain keyring to state
  const addPublicKeyPath = async (
    publicKeyPath: PublicKeyPath | SignedPublicKeyPath
  ) => {
    if ("signature" in publicKeyPath) {
      // Sign if required
      publicKeyPath.signature = await background.request({
        method: UI_RPC_METHOD_SIGN_MESSAGE_FOR_PUBLIC_KEY,
        params: [
          publicKeyPath,
          ethers.utils.base58.encode(
            Buffer.from(getCreateMessage(publicKeyPath.publicKey!), "utf-8")
          ),
          mnemonic,
        ],
      });
    }
    setSignedPublicKeyPaths([
      ...signedPublicKeyPaths,
      publicKeyPath as SignedPublicKeyPath,
    ]);
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
  };
};
