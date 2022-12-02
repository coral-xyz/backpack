import { useEffect, useState } from "react";
import type { KeyringInit } from "@coral-xyz/common";
import {
  BACKEND_API_URL,
  BACKPACK_FEATURE_USERNAMES,
  BrowserRuntimeExtension,
  UI_RPC_METHOD_KEYRING_STORE_CREATE,
  UI_RPC_METHOD_USERNAME_ACCOUNT_CREATE,
} from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { v4 as uuidv4 } from "uuid";

import { Loading } from "../../common";
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
  const [isValid, setIsValid] = useState(false);
  const background = useBackgroundClient();

  useEffect(() => {
    (async () => {
      const { id } = await createUser();
      createStore(id);
    })();
  }, []);

  //
  // Create the user in the backend
  //
  async function createUser(): Promise<{ id: string }> {
    // If userId is provided, then we are onboarding via the recover flow.
    if (userId) {
      return { id: userId };
    }
    // If userId is not provided and an invite code is not provided, then
    // this is dev mode.
    if (!inviteCode) {
      return { id: uuidv4() };
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
  async function createStore(uuid: string) {
    try {
      //
      // If usernames are disabled, use a default one for developing.
      //
      if (!BACKPACK_FEATURE_USERNAMES) {
        username = uuidv4().split("-")[0];
      }
      if (isAddingAccount) {
        await background.request({
          method: UI_RPC_METHOD_USERNAME_ACCOUNT_CREATE,
          params: [username, keyringInit, uuid],
        });
      } else {
        await background.request({
          method: UI_RPC_METHOD_KEYRING_STORE_CREATE,
          params: [username, password, keyringInit, uuid],
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
