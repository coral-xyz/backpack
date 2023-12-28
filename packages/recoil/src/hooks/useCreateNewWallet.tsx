import type { Blockchain } from "@coral-xyz/common";
import {
  UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_ADD,
  UI_RPC_METHOD_FIND_WALLET_DESCRIPTOR,
  UI_RPC_METHOD_KEYRING_DERIVE_WALLET,
  UI_RPC_METHOD_KEYRING_IMPORT_WALLET,
} from "@coral-xyz/common";
import { useRecoilValue } from "recoil";

import { allWallets, userClientAtom } from "../atoms";

import { useBackgroundClient } from "./";

export function useCreateNewWallet(blockchain: Blockchain) {
  const background = useBackgroundClient();
  const wallets = useRecoilValue(allWallets);
  const userClient = useRecoilValue(userClientAtom);
  const keyringExists = wallets.find(
    (wallet) => wallet.blockchain === blockchain
  );
  // If the keyring or if we don't have any public keys of the type we are
  // adding then additional logic is required to select the account index of
  // the first derivation path added
  const hasHdPublicKeys = wallets.find(
    (wallet) => wallet.blockchain === blockchain && wallet.type === "derived"
  );

  const createNewWithPhrase = async (): Promise<{ publicKey: string }> => {
    // Mnemonic based keyring. This is the simple case because we don't
    // need to prompt for the user to open their Ledger app to get the
    // required public key. We also don't need a signature to prove
    // ownership of the public key because that can't be done
    // transparently by the backend.

    const unlockResponse = await userClient.unlockKeyring();
    if (unlockResponse.error) {
      throw unlockResponse.error;
    }
    if (!keyringExists || !hasHdPublicKeys) {
      // No keyring or no existing mnemonic public keys so can't derive next
      // ph101pp todo
      const walletDescriptor = await background.request({
        method: UI_RPC_METHOD_FIND_WALLET_DESCRIPTOR,
        params: [blockchain, 0],
      });
      const signedWalletDescriptor = { ...walletDescriptor };
      if (!keyringExists) {
        // Keyring doesn't exist, create it
        // ph101pp todo
        await background.request({
          method: UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_ADD,
          params: [
            {
              mnemonic: true, // Use the existing mnemonic
              signedWalletDescriptors: [signedWalletDescriptor],
            },
          ],
        });
      } else {
        // Keyring exists but the hd keyring is not initialised, import
        // ph101pp todo
        await background.request({
          method: UI_RPC_METHOD_KEYRING_IMPORT_WALLET,
          params: [signedWalletDescriptor],
        });
      }
      return { publicKey: walletDescriptor.publicKey };
    } else {
      // ph101pp todo
      const publicKey = await background.request({
        method: UI_RPC_METHOD_KEYRING_DERIVE_WALLET,
        params: [blockchain],
      });

      return { publicKey };
    }
  };

  return { createNewWithPhrase };
}
