import type { Blockchain } from "@coral-xyz/common";
import {
  BACKEND_API_URL,
  UI_RPC_METHOD_KEYRING_STORE_LOCK,
  UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS,
} from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { ethers } from "ethers";

const { base58 } = ethers.utils;

export const useAuthentication = () => {
  const background = useBackgroundClient();

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
          message: base58.encode(Buffer.from(message, "utf-8")),
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
  const checkAuthentication = async (
    username: string,
    jwt: string
  ): Promise<
    | {
        id: string;
        publicKeys: Array<{ blockchain: Blockchain; publicKey: string }>;
        isAuthenticated: Boolean;
      }
    | undefined
  > => {
    try {
      const headers = {
        "Content-Type": "application/json",
        ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
      };
      const response = await fetch(`${BACKEND_API_URL}/users/${username}`, {
        method: "GET",
        headers,
      });
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
      console.error("no valid auth signers found");
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

  return { authenticate, checkAuthentication, getSigners, getAuthSigner };
};
