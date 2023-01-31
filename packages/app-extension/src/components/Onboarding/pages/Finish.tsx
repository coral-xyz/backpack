import { useEffect, useState } from "react";
import type { KeyringInit } from "@coral-xyz/common";
import {
  BACKEND_API_URL,
  BrowserRuntimeExtension,
  getAuthMessage,
  UI_RPC_METHOD_KEYRING_STORE_CREATE,
  UI_RPC_METHOD_KEYRING_STORE_KEEP_ALIVE,
  UI_RPC_METHOD_USERNAME_ACCOUNT_CREATE,
} from "@coral-xyz/common";
import { Loading } from "@coral-xyz/react-common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { v4 as uuidv4 } from "uuid";

import { useAuthentication } from "../../../hooks/useAuthentication";
import { SetupComplete } from "../../common/Account/SetupComplete";
import { getWaitlistId } from "../../common/WaitingRoom";

export const Finish = ({
  username,
  userId,
  password,
  keyringInit,
  inviteCode,
  isAddingAccount,
}: {
  username: string | null;
  password: string;
  keyringInit: KeyringInit;
  inviteCode?: string;
  userId?: string;
  isAddingAccount?: boolean;
}) => {
  const { authenticate } = useAuthentication();
  const [isValid, setIsValid] = useState(false);
  const background = useBackgroundClient();

  useEffect(() => {
    (async () => {
      // This is a mitigation to ensure the keyring store doesn't lock before
      // creating the user on the server.
      //
      // Would be better (though probably not a priority atm) to ensure atomicity.
      // E.g. we could generate the UUID here on the client, create the keyring store,
      // and only then create the user on the server. If the server fails, then
      // rollback on the client.
      //
      // An improvement for the future!
      if (isAddingAccount) {
        await background.request({
          method: UI_RPC_METHOD_KEYRING_STORE_KEEP_ALIVE,
          params: [],
        });
      }
      const { id, jwt } = await createUser();
      createStore(id, jwt);
    })();
  }, []);

  //
  // Create the user in the backend
  //
  async function createUser(): Promise<{ id: string; jwt: string }> {
    // If userId is provided, then we are onboarding via the recover flow.
    if (userId) {
      // Authenticate the user that the recovery has a JWT.
      // Take the first keyring init to fetch the JWT, it doesn't matter which
      // we use if there are multiple.
      const { blockchain, publicKey, signature } =
        keyringInit.blockchainKeyrings[0];
      const authData = {
        blockchain,
        publicKey,
        signature,
        message: getAuthMessage(userId),
      };
      const { jwt } = await authenticate(authData!);
      return { id: userId, jwt };
    }

    // If userId is not provided and an invite code is not provided, then
    // this is dev mode.
    if (!inviteCode) {
      return { id: uuidv4(), jwt: "" };
    }

    //
    // If we're down here, then we are creating a user for the first time.
    //
    const body = JSON.stringify({
      username,
      inviteCode,
      waitlistId: getWaitlistId?.(),
      blockchainPublicKeys: keyringInit.blockchainKeyrings.map((b) => ({
        blockchain: b.blockchain,
        publicKey: b.publicKey,
        signature: b.signature,
      })),
    });

    try {
      const res = await fetch(`${BACKEND_API_URL}/users`, {
        method: "POST",
        body,
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(await res.json());
      }
      return await res.json();
    } catch (err) {
      throw new Error("error creating account");
    }
  }

  //
  // Create the local store for the wallets
  //
  async function createStore(uuid: string, jwt: string) {
    try {
      //
      // If usernames are disabled, use a default one for developing.
      //
      if (isAddingAccount) {
        await background.request({
          method: UI_RPC_METHOD_USERNAME_ACCOUNT_CREATE,
          params: [username, keyringInit, uuid, jwt],
        });
      } else {
        await background.request({
          method: UI_RPC_METHOD_KEYRING_STORE_CREATE,
          params: [username, password, keyringInit, uuid, jwt],
        });
      }
      setIsValid(true);
    } catch (err) {
      console.log("account setup error", err);
      if (
        confirm("There was an issue setting up your account. Please try again.")
      ) {
        window.location.reload();
      }
    }
  }

  return isValid ? (
    <SetupComplete onClose={BrowserRuntimeExtension.closeActiveTab} />
  ) : (
    <Loading />
  );
};
