import { useEffect, useState } from "react";
import type { Blockchain } from "@coral-xyz/common";
import {
  BACKEND_API_URL,
  BACKPACK_FEATURE_JWT,
  BACKPACK_FEATURE_USERNAMES,
  UI_RPC_METHOD_KEYRING_STORE_LOCK,
  UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS,
  UI_RPC_METHOD_SIGN_MESSAGE_FOR_PUBLIC_KEY,
} from "@coral-xyz/common";
import { useBackgroundClient, useUser } from "@coral-xyz/recoil";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);
  // Public key/signature pairs that are required to sync the state of the
  // server public key data with the client data. A signature that is `undefined`
  // is one that has not been gathered yet, and a signature of `null` means the
  // user has opted to remove that public key from the server
  const [requiredSignatures, setRequiredSignatures] = useState<
    Array<{
      publicKey: string;
      signature: string | undefined | null;
      hardware: boolean;
    }>
  >([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const background = useBackgroundClient();
  const user = useUser();
  const jwtEnabled = !!(
    BACKPACK_FEATURE_USERNAMES &&
    BACKPACK_FEATURE_JWT &&
    user
  );

  useEffect(() => {
    (async () => {
      if (jwtEnabled) {
        const result = await checkAuthentication();
        if (result) {
          const { publicKeys, isAuthenticated } = await checkAuthentication();
          const { publicKeysToAdd, hardwareSigners } =
            await getRequiredSignatures(publicKeys);
          setIsAuthenticated(isAuthenticated);
          setRequiredSignatures(
            publicKeysToAdd.map((publicKey) => ({
              publicKey,
              signature: undefined,
              hardware: hardwareSigners.includes(publicKey),
            }))
          );
        }
      } else {
        setLoading(false);
      }
    })();
  }, []);

  /**
   * Iterate through the required signatures state and gather signatures either
   * by signing transparently or by displaying a drawer to the user to guide
   * them through the ledger flow.
   **/
  useEffect(() => {
    (async () => {
      // Get the next unresolves signature
      const nextIndex = requiredSignatures.findIndex(
        (s) => s.signature === undefined
      );
      // No more signatures needed
      if (nextIndex === -1) {
        // Job done
        console.log("job done");
        return;
      }

      const next = requiredSignatures[nextIndex];

      let signature: string | null;
      if (next.hardware) {
        // Display drawer
        signature = null;
      } else {
        signature = await background.request({
          method: UI_RPC_METHOD_SIGN_MESSAGE_FOR_PUBLIC_KEY,
          params: ["solana", "onboard", next.publicKey],
        });
      }
      if (signature && !isAuthenticated) {
        console.log("authenticating");
        authenticate();
      }
      // Add the signature to state
      const nextRequiredSignatures = requiredSignatures.map((s, i) => {
        if (i === nextIndex) {
          return {
            ...s,
            signature,
          };
        } else {
          return s;
        }
      });

      setRequiredSignatures(nextRequiredSignatures);
    })();
  }, [requiredSignatures]);

  /**
   * Query the server and see if the user has a valid JWT.
   */
  const checkAuthentication = async () => {
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
      }
      if (response.status !== 200) throw new Error(`could not fetch user`);
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
   * Login the user.
   */
  const authenticate = async () => {
    try {
      const response = await fetch(`${BACKEND_API_URL}/authenticate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.status !== 200) throw new Error(`could not authenticate`);
      return await response.json();
    } catch (err) {
      // Relock if authentication failed
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
  const getRequiredSignatures = async (serverPublicKeys: Array<string>) => {
    type NamedPublicKeys = Array<{ name: string; publicKey: string }>;
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

    // Transparent signers are those signers that Backpack can sign with on its
    // own, without needing to prompt the user (like for a Ledger signature)
    let transparentSigners: Array<string> = [];
    let hardwareSigners: Array<string> = [];
    for (const data of Object.values(clientPublicKeys)) {
      transparentSigners = transparentSigners.concat([
        ...data.hdPublicKeys.map((n) => n.publicKey),
        ...data.importedPublicKeys.map((n) => n.publicKey),
      ]);
      hardwareSigners = hardwareSigners.concat(
        data.ledgerPublicKeys.map((n) => n.publicKey)
      );
    }

    // Public keys that exist on the client that don't exist on the server
    const publicKeysToAdd = [...transparentSigners, ...hardwareSigners].filter(
      (k) => !serverPublicKeys.includes(k as string)
    );

    return { publicKeysToAdd, hardwareSigners };
  };

  return <>{loading ? "Authenticating" : children}</>;
}
