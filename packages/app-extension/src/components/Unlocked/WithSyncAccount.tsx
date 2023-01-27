import type React from "react";
import { useEffect, useState } from "react";
import type { Blockchain } from "@coral-xyz/common";
import {
  UI_RPC_METHOD_KEYRING_KEY_DELETE,
  UI_RPC_METHOD_KEYRING_STORE_MNEMONIC_SYNC,
  UI_RPC_METHOD_USER_ACCOUNT_PUBLIC_KEY_CREATE,
} from "@coral-xyz/common";
import {
  useBackgroundClient,
  useDehydratedWallets,
  useKeyringType,
} from "@coral-xyz/recoil";

import { useAuthentication } from "../../hooks/useAuthentication";

export function WithSyncAccount({
  serverPublicKeys,
  children,
}: {
  serverPublicKeys: Array<{ blockchain: Blockchain; publicKey: string }>;
  children: React.ReactElement;
}) {
  const background = useBackgroundClient();
  const { getSigners } = useAuthentication();
  const dehydratedWallets = useDehydratedWallets();
  const keyringType = useKeyringType();
  const [clientPublicKeys, setClientPublicKeys] = useState<
    Array<{ blockchain: Blockchain; publicKey: string; hardware: boolean }>
  >([]);
  const [syncAttempted, setSyncAttempted] = useState(false);

  useEffect(() => {
    (async () => {
      setClientPublicKeys(await getSigners());
    })();
  }, []);

  /**
   * Sign all transparently signable add messages with the required public keys.
   */
  useEffect(() => {
    (async () => {
      // Public key/signature pairs that are required to sync the state of the
      // server public key data with the client data.
      const danglingPublicKeys = clientPublicKeys.filter((c) => {
        // Filter to client public keys that don't exist on the server
        const existsServer = serverPublicKeys.find(
          (s) => s.blockchain === c.blockchain && s.publicKey === c.publicKey
        );
        return !existsServer;
      });

      for (const danglingPublicKey of danglingPublicKeys) {
        if (danglingPublicKey.hardware) {
          // Remove hardware public keys if they are not on the server
          // They can be added again through settings to capture the
          // signature
          try {
            await background.request({
              method: UI_RPC_METHOD_KEYRING_KEY_DELETE,
              params: [
                danglingPublicKey.blockchain,
                danglingPublicKey.publicKey,
              ],
            });
          } catch {
            // If the delete fails for some reason, don't error out because
            // the wallet will not be accessible
          }
        } else {
          // Sync all transparently signable public keys by adding them
          // to the server
          background.request({
            method: UI_RPC_METHOD_USER_ACCOUNT_PUBLIC_KEY_CREATE,
            params: [danglingPublicKey.blockchain, danglingPublicKey.publicKey],
          });
        }
      }
    })();
  }, [clientPublicKeys]);

  //
  // Attempt to find any dehydrated wallets on the mnemonic if a mnemonic is in use.
  //
  useEffect(() => {
    (async () => {
      try {
        if (
          keyringType === "mnemonic" &&
          dehydratedWallets.length > 0 &&
          !syncAttempted
        ) {
          // We need to only do this once, the dehydrated wallets array will change
          // if we find wallets and successfully load them and we don't want to
          // trigger this function for smaller and smaller dehydratedWallets arrays
          setSyncAttempted(true);
          await background.request({
            method: UI_RPC_METHOD_KEYRING_STORE_MNEMONIC_SYNC,
            params: [dehydratedWallets],
          });
        }
      } catch (error) {
        console.log("sync error", error);
      }
    })();
  }, [keyringType, dehydratedWallets, syncAttempted]);

  return children;
}
