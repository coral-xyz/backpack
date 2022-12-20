import { useEffect, useState } from "react";
import type { Blockchain, BlockchainKeyringInit } from "@coral-xyz/common";
import {
  BACKEND_API_URL,
  getAddMessage,
  UI_RPC_METHOD_SIGN_MESSAGE_FOR_PUBLIC_KEY,
} from "@coral-xyz/common";
import { Loading } from "@coral-xyz/react-common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { ethers } from "ethers";

import { WithDrawer } from "../common/Layout/Drawer";
import { HardwareOnboard } from "../Onboarding/pages/HardwareOnboard";

const { base58 } = ethers.utils;

export function WithSyncAccount({
  jwtEnabled,
  serverPublicKeys,
  clientPublicKeys,
  children,
}: {
  jwtEnabled: boolean;
  serverPublicKeys: Array<{ blockchain: Blockchain; publicKey: string }>;
  clientPublicKeys: Array<{
    blockchain: Blockchain;
    publicKey: string;
    hardware: boolean;
  }>;
  children: React.ReactElement;
}) {
  const background = useBackgroundClient();
  const [loading, setLoading] = useState(true);

  const [openDrawer, setOpenDrawer] = useState(false);
  // Public key/signature pairs that are required to sync the state of the
  // server public key data with the client data.
  const [requiredSignatures, setRequiredSignatures] = useState<
    Array<{
      blockchain: Blockchain;
      publicKey: string;
      hardware: boolean;
    }>
  >(
    // Signatures are required for all wallets that exist on the client that
    // do not exist on the server
    clientPublicKeys
      .filter((c) => {
        // Filter to client public keys that don't exist on the server
        const existsServer = serverPublicKeys.find(
          (s) => s.blockchain === c.blockchain && s.publicKey === c.publicKey
        );
        return !existsServer;
      })
      .map((c) => {
        return {
          ...c,
          signature: undefined,
        };
      })
  );

  /**
   * Sign all transparently signable add messages with the required public keys.
   */
  useEffect(() => {
    (async () => {
      if (jwtEnabled) {
        if (requiredSignatures.length === 0) {
          // Nothing left to sign
          setLoading(false);
        } else {
          for (const requiredSignature of requiredSignatures) {
            if (requiredSignature.hardware) continue;
            addPublicKeyToAccount(
              requiredSignature.blockchain,
              requiredSignature.publicKey
            );
          }
          setRequiredSignatures(requiredSignatures.filter((r) => r.hardware));
        }
      } else {
        // No JWT enabled, finish
        setLoading(false);
      }
    })();
  }, [requiredSignatures]);

  const addPublicKeyToAccount = async (
    blockchain: Blockchain,
    publicKey: string,
    signature?: string
  ) => {
    if (!signature) {
      const signature = await background.request({
        method: UI_RPC_METHOD_SIGN_MESSAGE_FOR_PUBLIC_KEY,
        params: [
          blockchain,
          base58.encode(Buffer.from(getAddMessage(publicKey), "utf-8")),
          publicKey,
        ],
      });

      const response = await fetch(`${BACKEND_API_URL}/users/publicKeys`, {
        method: "POST",
        body: JSON.stringify({
          blockchain,
          signature,
          publicKey,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error((await response.json()).msg);
      }
    }
  };

  const removePublicKeyFromAccount = async (
    blockchain: Blockchain,
    publicKey: string
  ) => {
    // Remove the key from the server
    const response = await fetch(`${BACKEND_API_URL}/users/publicKeys`, {
      method: "DELETE",
      body: JSON.stringify({
        blockchain,
        publicKey,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("could not remove public key");
    }
  };

  const nextHardwareSignature = requiredSignatures.find((r) => r.hardware);

  return (
    <>
      {loading ? <Loading /> : { children }}
      {nextHardwareSignature && (
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
            blockchain={nextHardwareSignature.blockchain}
            action="search"
            searchPublicKey={nextHardwareSignature.publicKey}
            signMessage={getAddMessage(nextHardwareSignature.publicKey)}
            signText="Sign the message to authenticate with Backpack."
            onSkip={() => {
              removePublicKeyFromAccount(
                nextHardwareSignature.blockchain,
                nextHardwareSignature.publicKey
              );
              // Remove the added public key from required signatures
              setRequiredSignatures(
                requiredSignatures.filter(
                  (c) =>
                    c.blockchain === nextHardwareSignature.blockchain &&
                    c.publicKey === nextHardwareSignature.publicKey &&
                    c.hardware
                )
              );
            }}
            onComplete={(keyringInit: BlockchainKeyringInit) => {
              addPublicKeyToAccount(
                keyringInit.blockchain,
                keyringInit.publicKey,
                keyringInit.signature
              );
              // Remove the added public key from required signatures
              setRequiredSignatures(
                requiredSignatures.filter(
                  (c) =>
                    c.blockchain === nextHardwareSignature.blockchain &&
                    c.publicKey === nextHardwareSignature.publicKey &&
                    c.hardware
                )
              );
            }}
          />
        </WithDrawer>
      )}
    </>
  );
}
