import {
  Blockchain,
  BrowserRuntimeExtension,
  DerivationPath,
  BACKPACK_FEATURE_USERNAMES,
  UI_RPC_METHOD_KEYRING_STORE_CREATE,
} from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loading } from "../../common";
import { SetupComplete } from "../../common/Account/SetupComplete";
import { getWaitlistId } from "../../common/WaitingRoom";

export const Finish = () => {
  const [isValid, setIsValid] = useState(false);
  const background = useBackgroundClient();
  const params = useParams<{
    blockchain: Blockchain;
    accountsAndDerivationPath: string;
    inviteCode: string;
    mnemonic: string;
    password: string;
    username: string;
    usernameAndPubkey: string;
  }>();

  const userIsRecoveringWallet = Boolean(params.usernameAndPubkey);

  const publicKey = "123";

  useEffect(() => {
    const { accounts, derivationPath } = (() => {
      try {
        return JSON.parse(params.accountsAndDerivationPath!);
      } catch (err) {
        // defaults when creating a wallet
        return { accounts: [0], derivationPath: DerivationPath.Bip44 };
      }
    })();

    //
    // Create the user in the backend
    //
    async function createUser() {
      if (BACKPACK_FEATURE_USERNAMES && !userIsRecoveringWallet) {
        const body = JSON.stringify({
          username: params.username,
          inviteCode: params.inviteCode,
          publicKey,
          waitlistId: getWaitlistId?.(),

          // order is significant, blockchain must be the last key atm
          // see `app.post("/users")` inside `backend/workers/auth/src/index.ts`
          blockchain: params.blockchain,
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
      const _username = (() => {
        try {
          const { username } = JSON.parse(params.usernameAndPubkey!);
          return username;
        } catch (err) {
          return params.username;
        }
      })();

      try {
        await background.request({
          method: UI_RPC_METHOD_KEYRING_STORE_CREATE,
          params: [
            params.blockchain,
            params.mnemonic,
            derivationPath,
            decodeURIComponent(params.password!),
            accounts,
          ],
        });
        setIsValid(true);
      } catch (err) {
        if (
          confirm(
            "There was an issue setting up your account. Please try again."
          )
        ) {
          window.location.reload();
        }
      }
    }
    createStore();
  }, []);

  return isValid ? (
    <SetupComplete onClose={BrowserRuntimeExtension.closeActiveTab} />
  ) : (
    <Loading />
  );
};
