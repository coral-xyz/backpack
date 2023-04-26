import { useEffect, useState } from "react";
import type {
  Blockchain,
  ServerPublicKey,
  SignedWalletDescriptor,
} from "@coral-xyz/common";
import {
  BACKEND_API_URL,
  getAuthMessage,
  UI_RPC_METHOD_KEYRING_KEY_DELETE,
  UI_RPC_METHOD_KEYRING_STORE_MNEMONIC_SYNC,
  UI_RPC_METHOD_USER_ACCOUNT_PUBLIC_KEY_CREATE,
  UI_RPC_METHOD_USER_JWT_UPDATE,
} from "@coral-xyz/common";
import {
  useAuthentication,
  useBackgroundClient,
  useDehydratedWallets,
  useKeyringHasMnemonic,
  useRpcRequests,
  useUser,
} from "@coral-xyz/recoil";

import { WithDrawer } from "../common/Layout/Drawer";
import { HardwareOnboard } from "../Onboarding/pages/HardwareOnboard";

export function WithAuth({ children }: { children: React.ReactElement }) {
  const { authenticate, checkAuthentication, getAuthSigner, getSigners } =
    useAuthentication();
  const background = useBackgroundClient();
  const user = useUser();
  const dehydratedWallets = useDehydratedWallets();
  const { signMessageForWallet } = useRpcRequests();

  const [authData, setAuthData] = useState<{
    publicKey: string;
    blockchain: Blockchain;
    hardware: boolean;
    message: string;
    userId: string;
  } | null>(null);
  const [authSignature, setAuthSignature] = useState<string | null>(null);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [serverPublicKeys, setServerPublicKeys] = useState<Array<{
    blockchain: Blockchain;
    publicKey: string;
  }> | null>(null);
  const [clientPublicKeys, setClientPublicKeys] = useState<
    Array<{ blockchain: Blockchain; publicKey: string; hardware: boolean }>
  >([]);
  const hasMnemonic = useKeyringHasMnemonic();
  const [syncAttempted, setSyncAttempted] = useState(false);

  /**
   * Check authentication status and take required actions to authenticate if
   * not authenticated.
   */
  useEffect(() => {
    setAuthSignature(null);
    setServerPublicKeys(null);
    (async () => {
      setClientPublicKeys(await getSigners());
      const result = user.jwt ? await checkAuthentication(user.jwt) : null;
      // These set state calls should be batched
      if (result) {
        const { publicKeys } = result;
        setServerPublicKeys(publicKeys);
      } else {
        // Not authenticated so couldn't get public keys, get the primary
        // public keys from a public endpoint and use one of those to auth
        const response = await fetch(
          `${BACKEND_API_URL}/users/${user.username}`
        );
        const serverPublicKeys = (await response.json()).publicKeys;
        setServerPublicKeys(serverPublicKeys);
        // Find a local signer that exists on the client and server and
        // set the auth data
        const signer = await getAuthSigner(
          serverPublicKeys.map((p: ServerPublicKey) => p.publicKey)
        );
        setAuthData({
          ...signer,
          message: getAuthMessage(user.uuid),
          userId: user.uuid,
        });
      }
    })();
    // Rerun authentication on user changes
  }, [user]);

  /**
   * When data for authentication is set, take the required action to get a signature.
   */
  useEffect(() => {
    (async () => {
      if (authData) {
        if (!authData.hardware) {
          // Auth signer is not a hardware wallet, sign transparent
          const signature = await signMessageForWallet(
            authData.blockchain,
            authData.publicKey,
            authData.message
          );
          setAuthSignature(signature);
        } else {
          // Auth signer is a hardware wallet, pop up a drawer to guide through
          // flow
          setOpenDrawer(true);
        }
      }
    })();
  }, [authData]);

  /**
   * When an auth signature is created, authenticate with it.
   */
  useEffect(() => {
    (async () => {
      if (authData && authSignature) {
        const { id, jwt, publicKeys } = await authenticate({
          ...authData,
          signature: authSignature,
        });
        // Update server public keys so we attempt to sync the non primary
        // public keys (i.e. those that require authentication to see)
        setServerPublicKeys(publicKeys);
        // Store the JWT from the authentication forl ater
        await background.request({
          method: UI_RPC_METHOD_USER_JWT_UPDATE,
          params: [id, jwt],
        });
        // Close the hardware sign drawer (if open)
        setOpenDrawer(false);
      }
    })();
  }, [authData, authSignature]);

  /**
   * Remove any hardware wallets that are on the client but not the server
   * because we can't transparently sign. For mnemmonic based wallets
   * transparently sign and add them to the server.
   */
  useEffect(() => {
    (async () => {
      if (!serverPublicKeys) return;
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
          await background.request({
            method: UI_RPC_METHOD_USER_ACCOUNT_PUBLIC_KEY_CREATE,
            params: [danglingPublicKey.blockchain, danglingPublicKey.publicKey],
          });
        }
      }
    })();
  }, [background, clientPublicKeys, serverPublicKeys]);

  //
  // Attempt to find any dehydrated wallets on the mnemonic if a mnemonic is in use.
  //
  useEffect(() => {
    (async () => {
      try {
        if (hasMnemonic) {
          if (dehydratedWallets.length > 0 && !syncAttempted) {
            // We need to only do this once, the dehydrated wallets array will change
            // if we find wallets and successfully load them and we don't want to
            // trigger this function for smaller and smaller dehydratedWallets arrays
            setSyncAttempted(true);
            // Do the sync
            await background.request({
              method: UI_RPC_METHOD_KEYRING_STORE_MNEMONIC_SYNC,
              params: [dehydratedWallets],
            });
          }
        } else {
          // If no mnemonic, don't try and sync again. When adding a mnemonic to a
          // keyring there is a small period where the notifications
          // haven't been processed which can trigger this again resulting in two
          // of the same wallet appearing in the wallet list.
          setSyncAttempted(true);
        }
      } catch (error) {
        console.log("sync error", error);
      }
    })();
  }, [background, hasMnemonic, dehydratedWallets, syncAttempted]);

  return (
    <>
      {children}
      {authData ? (
        <WithDrawer
          openDrawer={openDrawer}
          setOpenDrawer={setOpenDrawer}
          paperStyles={{
            height: "calc(100% - 56px)",
            borderTopLeftRadius: "12px",
            borderTopRightRadius: "12px",
          }}
        >
          <HardwareOnboard
            blockchain={authData!.blockchain}
            action="search"
            searchPublicKey={authData!.publicKey}
            signMessage={authData!.message}
            signText="Sign the message to authenticate with Backpack."
            onComplete={(signedWalletDescriptor: SignedWalletDescriptor) => {
              setAuthSignature(signedWalletDescriptor.signature);
            }}
          />
        </WithDrawer>
      ) : null}
    </>
  );
}
