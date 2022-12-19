import { useEffect, useState } from "react";
import type { Blockchain, BlockchainKeyringInit } from "@coral-xyz/common";
import {
  BACKPACK_FEATURE_JWT,
  BACKPACK_FEATURE_USERNAMES,
  getAuthMessage,
  UI_RPC_METHOD_SIGN_MESSAGE_FOR_PUBLIC_KEY,
  UI_RPC_METHOD_USER_JWT_UPDATE,
} from "@coral-xyz/common";
import { Loading } from "@coral-xyz/react-common";
import { useBackgroundClient, useUser } from "@coral-xyz/recoil";
import { ethers } from "ethers";

import { useAuthentication } from "../../hooks/useAuthentication";
import { WithDrawer } from "../common/Layout/Drawer";
import { HardwareOnboard } from "../Onboarding/pages/HardwareOnboard";

import { WithSyncAccount } from "./WithSyncAccount";

const { base58 } = ethers.utils;

export function WithAuth({ children }: { children: React.ReactElement }) {
  const { authenticate, checkAuthentication, getSigners, getAuthSigner } =
    useAuthentication();
  const background = useBackgroundClient();
  const user = useUser();

  const [authData, setAuthData] = useState<{
    publicKey: string;
    blockchain: Blockchain;
    hardware: boolean;
    message: string;
    userId: string;
  } | null>(null);
  const [authSignature, setAuthSignature] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [clientPublicKeys, setClientPublicKeys] = useState<
    Array<{ blockchain: Blockchain; publicKey: string; hardware: boolean }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [serverPublicKeys, setServerPublicKeys] = useState<
    Array<{ blockchain: Blockchain; publicKey: string }>
  >([]);

  const jwtEnabled = !!(BACKPACK_FEATURE_USERNAMES && BACKPACK_FEATURE_JWT);

  /**
   * Check authentication status and take required actions to authenticate if
   * not authenticated.
   */
  useEffect(() => {
    (async () => {
      if (!jwtEnabled) {
        // Already authenticated or not using JWTs
        setLoading(false);
      } else {
        setAuthSignature(null);
        setLoading(true);
        const result = await checkAuthentication(user.username, user.jwt);
        // These set state calls should be batched
        setClientPublicKeys(await getSigners());
        if (result) {
          setIsAuthenticated(result.isAuthenticated);
          setServerPublicKeys(result.publicKeys);
        }
      }
    })();
    // Rerun authentication on user changes
  }, [user]);

  /**
   * If the user is not authenticated, find a signer that exists on the client
   * and the server and set the auth data.
   */
  useEffect(() => {
    if (!isAuthenticated) {
      (async () => {
        const authData = await getAuthSigner(
          serverPublicKeys.map((p) => p.publicKey)
        );
        if (authData) {
          setAuthData({
            ...authData,
            message: getAuthMessage(user.uuid),
            userId: user.uuid,
          });
        }
      })();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, serverPublicKeys]);

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
              base58.encode(Buffer.from(authData.message, "utf-8")),
              authData.publicKey,
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
        setLoading(false);
        setOpenDrawer(false);
      }
    })();
  }, [authData, authSignature]);

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <WithSyncAccount
          jwtEnabled={jwtEnabled}
          clientPublicKeys={clientPublicKeys}
          serverPublicKeys={serverPublicKeys}
        >
          {children}
        </WithSyncAccount>
      )}
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
            onComplete={(keyringInit: BlockchainKeyringInit) => {
              setAuthSignature(keyringInit.signature);
            }}
          />
        </WithDrawer>
      )}
    </>
  );
}
