import {
  BrowserRuntimeExtension,
  KeyringInit,
  UI_RPC_METHOD_KEYRING_STORE_CREATE,
} from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { useEffect, useState } from "react";
import { Loading } from "../../common";
import { SetupComplete } from "../../common/Account/SetupComplete";
import { getWaitlistId } from "../../common/WaitingRoom";

export const Finish = ({
  username,
  password,
  keyringInit,
  inviteCode,
}: {
  username: string | null;
  password: string;
  keyringInit: KeyringInit;
  inviteCode?: string;
}) => {
  const [isValid, setIsValid] = useState(false);
  const background = useBackgroundClient();

  useEffect(() => {
    (async () => {
      await createUser();
      createStore();
    })();
  }, []);

  //
  // Create the user in the backend
  //
  async function createUser() {
    if (inviteCode) {
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
        const res = await fetch("https://auth.xnfts.dev/users", {
          method: "POST",
          body,
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) {
          throw new Error(await res.json());
        }
      } catch (err) {
        throw new Error("error creating account");
      }
    }
  }

  //
  // Create the local store for the wallets
  //
  async function createStore() {
    try {
      await background.request({
        method: UI_RPC_METHOD_KEYRING_STORE_CREATE,
        params: [username, password, keyringInit],
      });
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
