import { useEffect, useState } from "react";
import type { Blockchain, SignedWalletDescriptor } from "@coral-xyz/common";
import {
  getAuthMessage,
  UI_RPC_METHOD_KEYRING_KEY_DELETE,
  UI_RPC_METHOD_KEYRING_STORE_MNEMONIC_SYNC,
  UI_RPC_METHOD_SIGN_MESSAGE_FOR_PUBLIC_KEY,
  UI_RPC_METHOD_USER_ACCOUNT_PUBLIC_KEY_CREATE,
  UI_RPC_METHOD_USER_JWT_UPDATE,
} from "@coral-xyz/common";
import {
  useBackgroundClient,
  useDehydratedWallets,
  useKeyringHasMnemonic,
  useUser,
} from "@coral-xyz/recoil";
import { ethers } from "ethers";

import { useAuthentication } from "../../hooks/useAuthentication";
import { WithDrawer } from "../common/Layout/Drawer";
import { HardwareOnboard } from "../Onboarding/pages/HardwareOnboard";

export function WithAuth({ children }: { children: React.ReactElement }) {
  const { authenticate, checkAuthentication, getAuthSigner, getSigners } =
    useAuthentication();
  const background = useBackgroundClient();
  const user = useUser();
  const dehydratedWallets = useDehydratedWallets();

  const [authData, setAuthData] = useState<{
    publicKey: string;
    blockchain: Blockchain;
    hardware: boolean;
    message: string;
    userId: string;
  } | null>(null);
  const [authSignature, setAuthSignature] = useState<string | null>(null);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [serverAccountState, setServerAccountState] = useState<{
    isAuthenticated: boolean;
    publicKeys: Array<{ blockchain: Blockchain; publicKey: string }>;
  } | null>(null);
  const [clientPublicKeys, setClientPublicKeys] = useState<
    Array<{ blockchain: Blockchain; publicKey: string; hardware: boolean }>
  >([]);
  const hasMnemonic = useKeyringHasMnemonic();
  const [syncAttempted, setSyncAttempted] = useState(false);

  useEffect(() => {
    (async () => {
      setClientPublicKeys(await getSigners());
    })();
  }, []);

  /**
   * Check authentication status and take required actions to authenticate if
   * not authenticated.
   */
  useEffect(() => {
    (async () => {
      setAuthSignature(null);
      const result = await checkAuthentication(user.username, user.jwt);
      // These set state calls should be batched
      if (result) {
        const { isAuthenticated, publicKeys } = result;
        setServerAccountState({ isAuthenticated, publicKeys });
      }
    })();
    // Rerun authentication on user changes
  }, [user]);

  /**
   * If the user is not authenticated, find a signer that exists on the client
   * and the server and set the auth data.
   */
  useEffect(() => {
    if (serverAccountState) {
      if (!serverAccountState.isAuthenticated) {
        (async () => {
          const authData = await getAuthSigner(
            serverAccountState.publicKeys.map((p) => p.publicKey)
          );
          if (authData) {
            setAuthData({
              ...authData,
              message: getAuthMessage(user.uuid),
              userId: user.uuid,
            });
          }
        })();
      }
    }
  }, [serverAccountState]);

  /**
   * When an auth signer is found, take the required action to get a signature.
   */
  useEffect(() => {
    (async () => {
      if (authData) {
        if (!authData.hardware) {
          // Auth signer is not a hardware wallet, sign transparent
          const signature = await background.request({
            method: UI_RPC_METHOD_SIGN_MESSAGE_FOR_PUBLIC_KEY,
            params: [
              authData.blockchain,
              authData.publicKey,
              ethers.utils.base58.encode(
                Buffer.from(authData.message, "utf-8")
              ),
            ],
          });
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
        const { id, jwt } = await authenticate({
          ...authData,
          signature: authSignature,
        });
        await background.request({
          method: UI_RPC_METHOD_USER_JWT_UPDATE,
          params: [id, jwt],
        });
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
      if (!serverAccountState) return;
      // Public key/signature pairs that are required to sync the state of the
      // server public key data with the client data.
      const danglingPublicKeys = clientPublicKeys.filter((c) => {
        // Filter to client public keys that don't exist on the server
        const existsServer = serverAccountState.publicKeys.find(
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
  }, [clientPublicKeys, serverAccountState]);

  //
  // Attempt to find any dehydrated wallets on the mnemonic if a mnemonic is in use.
  //
  useEffect(() => {
    (async () => {
      try {
        if (hasMnemonic && dehydratedWallets.length > 0 && !syncAttempted) {
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
      } catch (error) {
        console.log("sync error", error);
      }
    })();
  }, [hasMnemonic, dehydratedWallets, syncAttempted]);

  return (
    <>
      {children}
      {authData && (
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
      )}
    </>
  );
}
