import { useEffect, useState } from "react";
import type { Blockchain } from "@coral-xyz/common";
import {
  BACKEND_API_URL,
  getAddMessage,
  UI_RPC_METHOD_SIGN_MESSAGE_FOR_PUBLIC_KEY,
} from "@coral-xyz/common";
import { Loading } from "@coral-xyz/react-common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { ethers } from "ethers";

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

  /**
   * Sign all transparently signable add messages with the required public keys.
   */
  useEffect(() => {
    (async () => {
      if (jwtEnabled) {
        // Public key/signature pairs that are required to sync the state of the
        // server public key data with the client data.
        const danglingPublicKeys = clientPublicKeys.filter((c) => {
          // Filter to client public keys that don't exist on the server
          const existsServer = serverPublicKeys.find(
            (s) => s.blockchain === c.blockchain && s.publicKey === c.publicKey
          );
          return !existsServer;
        });

        if (danglingPublicKeys.length === 0) {
          // Nothing left to sign
          setLoading(false);
        } else {
          for (const danglingPublicKey of danglingPublicKeys) {
            // TODO - skip hardware wallets for now
            if (danglingPublicKey.hardware) {
              removePublicKeyFromAccount(
                danglingPublicKey.blockchain,
                danglingPublicKey.publicKey
              );
            } else {
              addPublicKeyToAccount(
                danglingPublicKey.blockchain,
                danglingPublicKey.publicKey
              );
            }
          }
        }
      } else {
        // No JWT enabled, finish
        setLoading(false);
      }
    })();
  }, []);

  // Add a public key to a Backpack account
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

  // Remove a public key from a Backapck account
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

  return loading ? <Loading /> : children;
}
