import {
  Blockchain,
  BrowserRuntimeExtension,
  DerivationPath,
  BACKPACK_FEATURE_USERNAMES,
  UI_RPC_METHOD_KEYRING_STORE_CREATE,
} from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { useEffect, useState } from "react";
import { Loading } from "../../common";
import { SetupComplete } from "../../common/Account/SetupComplete";
import { getWaitlistId } from "../../common/WaitingRoom";

export type KeyringInit = {
  // No mnemonic means this is a hardware wallet keyring
  mnemonic?: string;
  blockchainKeyrings: Array<BlockchainKeyringInit>;
};

export type BlockchainKeyringInit = {
  blockchain: Blockchain;
  derivationPath: DerivationPath;
  accountIndex: number;
  publicKey: string;
  signature: string;
};

export const Finish = ({
  inviteCode,
  username,
  password,
  keyringInit,
}: {
  inviteCode: string;
  username: string;
  password: string;
  keyringInit: KeyringInit;
}) => {
  const [isValid, setIsValid] = useState(false);
  const background = useBackgroundClient();

  const isRecovery = false;

  useEffect(() => {
    (async () => {
      // await createUser();
      createStore();
    })();
  }, []);

  //
  // Create the user in the backend
  //
  async function createUser() {
    if (BACKPACK_FEATURE_USERNAMES && !isRecovery) {
      const body = JSON.stringify({
        username,
        inviteCode,
        waitlistId: getWaitlistId?.(),
        blockchainKeyrings: keyringInit.blockchainKeyrings,
      });

      try {
        const res = await fetch("https://auth.xnfts.dev/users", {
          method: "POST",
          body,
          headers: {
            "Content-Type": "application/json",
            "x-backpack-signature": "123",
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
