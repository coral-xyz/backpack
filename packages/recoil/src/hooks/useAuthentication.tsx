import { useCallback } from "react";
import type { Blockchain } from "@coral-xyz/common";
import {
  UI_RPC_METHOD_KEYRING_STORE_LOCK,
  UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS,
  UI_RPC_METHOD_USER_ACCOUNT_AUTH,
  UI_RPC_METHOD_USER_ACCOUNT_READ,
} from "@coral-xyz/common";

import { useBackgroundClient } from "./client";

export const useAuthentication = () => {
  const background = useBackgroundClient();

  /**
   * Login the user.
   */
  const authenticate = useCallback(
    async ({
      blockchain,
      publicKey,
      message,
      signature,
    }: {
      blockchain: Blockchain;
      publicKey: string;
      signature: string;
      message: string;
    }) => {
      try {
        const res = await background.request({
          method: UI_RPC_METHOD_USER_ACCOUNT_AUTH,
          params: [blockchain, publicKey, message, signature],
        });

        return res;
      } catch (error) {
        // Relock if authentication failed
        await background.request({
          method: UI_RPC_METHOD_KEYRING_STORE_LOCK,
          params: [],
        });
      }
    },
    [background]
  );

  /**
   * Query the server and see if the user has a valid JWT..
   */
  const checkAuthentication = async (
    jwt?: string
  ): Promise<{
    id: string;
    publicKeys: Array<{ blockchain: Blockchain; publicKey: string }>;
  } | null> => {
    try {
      return await background.request({
        method: UI_RPC_METHOD_USER_ACCOUNT_READ,
        params: [jwt],
      });
    } catch (error: any) {
      // Relock if authentication failed
      if (error.toString().includes("user not authenticated")) {
        // 403
        return null;
      } else {
        console.error("useAuthentication:checkAuthentication", error);
        await background.request({
          method: UI_RPC_METHOD_KEYRING_STORE_LOCK,
          params: [],
        });
        return null;
      }
    }
  };

  /**
   * Return all the public keys in Backpack and some useful information
   * (blockchain, hardware) for use in authentication flows.
   */
  const getSigners = async () => {
    type NamedPublicKeys = Array<{ name: string; publicKey: string }>;
    // TODO refactor the RPC call to return this data structure and delete
    // this
    const clientPublicKeys = (await background.request({
      method: UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS,
      params: [],
    })) as Record<
      Blockchain,
      {
        hdPublicKeys: NamedPublicKeys;
        importedPublicKeys: NamedPublicKeys;
        ledgerPublicKeys: NamedPublicKeys;
      }
    >;

    let signers: Array<{
      publicKey: string;
      blockchain: Blockchain;
      hardware: boolean;
    }> = [];
    for (const [blockchain, data] of Object.entries(clientPublicKeys)) {
      signers = signers.concat([
        ...data.hdPublicKeys.map((n) => ({
          ...n,
          blockchain: blockchain as Blockchain,
          hardware: false,
        })),
        ...data.importedPublicKeys.map((n) => ({
          ...n,
          blockchain: blockchain as Blockchain,
          hardware: false,
        })),
        ...data.ledgerPublicKeys.map((n) => ({
          ...n,
          blockchain: blockchain as Blockchain,
          hardware: true,
        })),
      ]);
    }
    return signers;
  };

  /**
   * Find the most suitable signer for signing an authentication message. The
   * most suitable signer is one that Backpack can sign with transparently
   * that has a matching public key on the server, or fall back to hardware
   * signers.
   */
  const getAuthSigner = async (serverPublicKeys: Array<String>) => {
    // Intersection of local signers with public keys stored on the server
    const signers = (await getSigners()).filter((k) =>
      serverPublicKeys.includes(k.publicKey)
    );

    if (signers.length === 0) {
      // This should never happen
      console.error("useAuthentication:getAuthSigner::no signers");
      await background.request({
        method: UI_RPC_METHOD_KEYRING_STORE_LOCK,
        params: [],
      });
    }
    // Try and find a transparent server (i.e. not hardware based) as the first
    // choice
    const transparentSigner = signers.find((s) => !s.hardware);
    // If no transparent signer, just return the first (hardware) signer
    return transparentSigner ? transparentSigner : signers[0];
  };

  return {
    authenticate,
    checkAuthentication,
    getSigners,
    getAuthSigner,
  };
};
