import { useEffect, useState } from "react";
import type { Blockchain, BlockchainKeyringInit } from "@coral-xyz/common";
import {
  BACKPACK_FEATURE_JWT,
  BACKPACK_FEATURE_USERNAMES,
  getAuthMessage,
  UI_RPC_METHOD_SIGN_MESSAGE_FOR_PUBLIC_KEY,
  UI_RPC_METHOD_USER_JWT_UPDATE,
} from "@coral-xyz/common";
import { useBackgroundClient, useUser } from "@coral-xyz/recoil";
import { ethers } from "ethers";

import { useAuthentication } from "../../hooks/useAuthentication";
import { Loading } from "../common";
import { WithDrawer } from "../common/Layout/Drawer";
import { HardwareOnboard } from "../Onboarding/pages/HardwareOnboard";

const { base58 } = ethers.utils;

export function WithAuth({ children }: { children: React.ReactElement }) {
  const { authenticate, checkAuthentication, getAuthSigner } =
    useAuthentication();
  const background = useBackgroundClient();
  const user = useUser();
  const [loading, setLoading] = useState(true);
  const [authData, setAuthData] = useState<{
    publicKey: string;
    blockchain: Blockchain;
    hardware: boolean;
    message: string;
    userId: string;
  } | null>(null);
  const [authSignature, setAuthSignature] = useState<string | null>(null);
  const [openDrawer, setOpenDrawer] = useState(false);

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
        if (result) {
          if (result.isAuthenticated) {
            setLoading(false);
          } else {
            const authData = await getAuthSigner(
              result.publicKeys.map((p) => p.publicKey)
            );
            if (authData) {
              setAuthData({
                ...authData,
                message: getAuthMessage(user.uuid),
                userId: user.uuid,
              });
            }
          }
        }
      }
    })();
    // Rerun authentication on user changes
  }, [user]);

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
      {loading ? <Loading /> : children}
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
