import type { Blockchain } from "@coral-xyz/common";
import {
  BACKEND_API_URL,
  UI_RPC_METHOD_KEYRING_STORE_LOCK,
  UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS,
} from "@coral-xyz/common";
import { useBackgroundClient, useUser } from "@coral-xyz/recoil";

export const useAuthentication = () => {
  const background = useBackgroundClient();
  const user = useUser();

  /**
   * Login the user.
   */
  const authenticate = async ({
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
      const response = await fetch(`${BACKEND_API_URL}/authenticate`, {
        method: "POST",
        body: JSON.stringify({
          blockchain,
          signature,
          publicKey,
          message,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.status !== 200) throw new Error(`could not authenticate`);
      return await response.json();
    } catch (err) {
      console.error("error authenticating", err);
      // Relock if authentication failed
      await background.request({
        method: UI_RPC_METHOD_KEYRING_STORE_LOCK,
        params: [],
      });
    }
  };

  /**
   * Query the server and see if the user has a valid JWT..
   */
  const checkAuthentication = async (): Promise<
    | {
        publicKeys: Array<{ blockchain: Blockchain; publicKey: string }>;
        isAuthenticated: Boolean;
      }
    | undefined
  > => {
    try {
      const response = await fetch(
        `${BACKEND_API_URL}/users/${user.username}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 404) {
        // User does not exist on server, how to handle?
        throw new Error("user does not exist");
      } else if (response.status !== 200) {
        throw new Error(`could not fetch user`);
      }
      return await response.json();
    } catch (err) {
      console.error("error checking authentication", err);
      // Relock if authentication failed
      await background.request({
        method: UI_RPC_METHOD_KEYRING_STORE_LOCK,
        params: [],
      });
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

  return { authenticate, checkAuthentication, getSigners };
};
