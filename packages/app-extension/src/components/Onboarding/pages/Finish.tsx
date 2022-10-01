import {
  BrowserRuntimeExtension,
  DerivationPath,
  UI_RPC_METHOD_KEYRING_STORE_CREATE,
} from "@coral-xyz/common";
import { useBackgroundClient, useUsername } from "@coral-xyz/recoil";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loading } from "../../common";
import { SetupComplete } from "../../common/Account/SetupComplete";
import { getWaitlistId } from "./WaitingRoom";

export const Finish = () => {
  const [isValid, setIsValid] = useState(false);
  const background = useBackgroundClient();
  const params = useParams<{
    accountIndices: string;
    derivationPath: string;
    inviteCode: string;
    mnemonic: string;
    password: string;
    username: string;
  }>();

  useEffect(() => {
    async function createStore() {
      try {
        await background.request({
          method: UI_RPC_METHOD_KEYRING_STORE_CREATE,
          params: [
            params.mnemonic,
            params.derivationPath ?? DerivationPath.Bip44,
            params.password,
            params.accountIndices ? JSON.parse(params.accountIndices) : [0],
            params.username,
            params.inviteCode,
            getWaitlistId?.(),
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
