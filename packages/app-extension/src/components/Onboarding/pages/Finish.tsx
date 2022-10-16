import {
  Blockchain,
  BrowserRuntimeExtension,
  DerivationPath,
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

  useEffect(() => {
    const { accounts, derivationPath } = (() => {
      try {
        return JSON.parse(params.accountsAndDerivationPath!);
      } catch (err) {
        // defaults when creating a wallet
        return { accounts: [0], derivationPath: DerivationPath.Bip44 };
      }
    })();

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
            _username,
            params.inviteCode,
            getWaitlistId?.(),
            Boolean(params.usernameAndPubkey),
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
