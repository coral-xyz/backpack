import type { Blockchain } from "@coral-xyz/common";
import {
  getIndexedPath,
  UI_RPC_METHOD_PREVIEW_PUBKEYS,
} from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";

export const useDefaultWalletDescriptor = () => {
  const background = useBackgroundClient();

  const getDefaultWalletDescriptor = async (
    blockchain: Blockchain,
    mnemonic: string
  ) => {
    const defaultDerivationPath = getIndexedPath(blockchain, 0, 0);
    const publicKeys = await background.request({
      method: UI_RPC_METHOD_PREVIEW_PUBKEYS,
      params: [blockchain, mnemonic, [defaultDerivationPath]],
    });
    const publicKey = publicKeys[0];
    return {
      derivationPath: defaultDerivationPath,
      publicKey,
    };
  };

  return {
    getDefaultWalletDescriptor,
  };
};
