import { useEffect, useState } from "react";
import {
  BACKEND_API_URL,
  BACKPACK_FEATURE_JWT,
  BACKPACK_FEATURE_USERNAMES,
  UI_RPC_METHOD_KEYRING_STORE_LOCK,
  UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS,
  UI_RPC_METHOD_SIGN_MESSAGE_FOR_PUBLIC_KEY,
} from "@coral-xyz/common";
import { useBackgroundClient, useUsername } from "@coral-xyz/recoil";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);
  const background = useBackgroundClient();
  const username = useUsername();

  useEffect(() => {
    (async () => {
      if (BACKPACK_FEATURE_USERNAMES && BACKPACK_FEATURE_JWT && username) {
        const { id, publicKeys, isAuthenticated } = await checkAuthentication();
        console.log(requiredSignatures(id, publicKeys, isAuthenticated));
      } else {
        setLoading(false);
      }
    })();
  }, []);

  /**
   * Query the server and see if the user has a valid JWT.
   */
  const checkAuthentication = async () => {
    try {
      const response = await fetch(`${BACKEND_API_URL}/authenticate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);

      if (response.status !== 200)
        throw new Error(`could not fetch authentication status`);
      return await response.json();
    } catch (err) {
      // Relock if authentication failed
      console.error("error checking auth", err);
      await background.request({
        method: UI_RPC_METHOD_KEYRING_STORE_LOCK,
        params: [],
      });
    }
  };

  /**
   * Determine the signatures that are required for authentication and for
   * ensuring all client side public keys are stored on the Backpack account.
   */
  const requiredSignatures = async (
    userId: string,
    serverPublicKeys: Array<string>,
    isAuthenticated: boolean
  ) => {
    const clientPublicKeys = await background.request({
      method: UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS,
      params: [],
    });

    console.log(clientPublicKeys);
    console.log(Object.values(clientPublicKeys));
    console.log(Object.values(clientPublicKeys).flat());

    // Public keys that exist on the client that don't exist on the server
    const publicKeysToAdd = Object.values(clientPublicKeys)
      .flat()
      .filter((k) => !serverPublicKeys.includes(k as string));

    // JWT is set and there is no public keys to sync to the server
    if (isAuthenticated && publicKeysToAdd.length === 0) return [];

    // Transparent signers are those signers that Backpack can sign with on its
    // own, without needing to prompt the user (like for a Ledger signature)
    const transparentSigners = [
      ...clientPublicKeys.hdKeyring,
      ...clientPublicKeys.importedKeyring,
    ];

    let jwtAuthSigner;
    if (!isAuthenticated) {
      // Not authenticated, attempt to auth using a public key that we can sign
      // with transparently

      // First, check if theres a transparent signer that we need a signature
      // for anyway to potentially reduce the number of signing RPC requests
      const signers = transparentSigners.filter((k) =>
        publicKeysToAdd.includes(k)
      );
      if (signers) {
        jwtAuthSigner = signers[0];
      } else if (transparentSigners.length > 0) {
        // Next best choice is any of the transparent signers
        jwtAuthSigner = transparentSigners[0];
      } else {
        // Ledger is the only option, and the least preferred since it
        // requires user intervention
        jwtAuthSigner = clientPublicKeys.ledgerKeyring[0];
      }
    }

    // List of public keys that require signatures
    const publicKeysForSigning = [new Set([...publicKeysToAdd, jwtAuthSigner])];
    for (const publicKey in publicKeysForSigning) {
      const signature = await background.request({
        method: UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS,
        params: [],
      });
    }
  };

  /**
   * Login the user.
   */
  const login = async (id: string, serverPublicKeys: Array<string>) => {
    const clientPublicKeys = await background.request({
      method: UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS,
      params: [],
    });
    console.log(clientPublicKeys);
    /**
    const response = await fetch(`http://localhost:8787/authenticate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    **/
  };

  return <>{loading ? "Authenticating" : children}</>;
}
