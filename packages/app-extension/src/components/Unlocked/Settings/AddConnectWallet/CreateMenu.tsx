import { useEffect, useState } from "react";
import type { Blockchain } from "@coral-xyz/common";
import {
  getAddMessage,
  UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_ADD,
  UI_RPC_METHOD_FIND_WALLET_DESCRIPTOR,
  UI_RPC_METHOD_KEYRING_DERIVE_WALLET,
  UI_RPC_METHOD_KEYRING_IMPORT_WALLET,
  UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS,
} from "@coral-xyz/common";
import {
  useBackgroundClient,
  useEnabledBlockchains,
  useKeyringHasMnemonic,
  useRpcRequests,
} from "@coral-xyz/recoil";

import {
  useDrawerContext,
  WithMiniDrawer,
} from "../../../common/Layout/Drawer";
import { useNavigation } from "../../../common/Layout/NavStack";

import { ConfirmCreateWallet } from "./";

export function CreateMenuAction({ blockchain }: { blockchain: Blockchain }) {
  const nav = useNavigation();
  const background = useBackgroundClient();
  const hasMnemonic = useKeyringHasMnemonic();
  const enabledBlockchains = useEnabledBlockchains();
  const keyringExists = enabledBlockchains.includes(blockchain);
  const { close: closeParentDrawer } = useDrawerContext();
  const { signMessageForWallet } = useRpcRequests();

  const [newPublicKey, setNewPublicKey] = useState("");
  const [openDrawer, setOpenDrawer] = useState(false);
  const [loading, setLoading] = useState(false);

  // If the keyring or if we don't have any public keys of the type we are
  // adding then additional logic is required to select the account index of
  // the first derivation path added
  const [hasHdPublicKeys, setHasHdPublicKeys] = useState(false);

  useEffect(() => {
    (async () => {
      const publicKeys = await background.request({
        method: UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS,
        params: [],
      });
      const blockchainPublicKeys = publicKeys[blockchain];
      if (blockchainPublicKeys) {
        setHasHdPublicKeys(blockchainPublicKeys.hdPublicKeys.length > 0);
      }

      createNewWithPhrase();
    })();
  }, [background, blockchain]);

  const createNewWithPhrase = async () => {
    // Mnemonic based keyring. This is the simple case because we don't
    // need to prompt for the user to open their Ledger app to get the
    // required public key. We also don't need a signature to prove
    // ownership of the public key because that can't be done
    // transparently by the backend.
    if (loading) {
      return;
    }
    if (hasMnemonic) {
      setOpenDrawer(true);
      setLoading(true);
      let newPublicKey;
      if (!keyringExists || !hasHdPublicKeys) {
        // No keyring or no existing mnemonic public keys so can't derive next
        const walletDescriptor = await background.request({
          method: UI_RPC_METHOD_FIND_WALLET_DESCRIPTOR,
          params: [blockchain, 0],
        });
        const signature = await signMessageForWallet(
          blockchain,
          walletDescriptor.publicKey,
          getAddMessage(walletDescriptor.publicKey),
          {
            mnemonic: true,
            signedWalletDescriptors: [
              {
                ...walletDescriptor,
                signature: "",
              },
            ],
          }
        );
        const signedWalletDescriptor = { ...walletDescriptor, signature };
        if (!keyringExists) {
          // Keyring doesn't exist, create it
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
          await background.request({
            method: UI_RPC_METHOD_KEYRING_IMPORT_WALLET,
            params: [signedWalletDescriptor],
          });
        }
        newPublicKey = walletDescriptor.publicKey;
      } else {
        newPublicKey = await background.request({
          method: UI_RPC_METHOD_KEYRING_DERIVE_WALLET,
          params: [blockchain],
        });
      }
      setNewPublicKey(newPublicKey);
      setLoading(false);
    } else {
      nav.push("import-from-mnemonic", {
        blockchain,
        keyringExists,
        inputMnemonic: true,
        forceSetMnemonic: true,
      });
    }
  };

  return (
    <WithMiniDrawer
      openDrawer={openDrawer}
      setOpenDrawer={setOpenDrawer}
      backdropProps={{
        style: {
          opacity: 0.8,
          background: "#18181b",
        },
      }}
    >
      <ConfirmCreateWallet
        blockchain={blockchain}
        publicKey={newPublicKey}
        onClose={() => {
          setOpenDrawer(false);
          closeParentDrawer();
        }}
        isLoading={loading}
      />
    </WithMiniDrawer>
  );
}
