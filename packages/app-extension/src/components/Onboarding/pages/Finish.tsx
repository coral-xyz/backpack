import { useEffect, useState } from "react";
import {
  BrowserRuntimeExtension,
  UI_RPC_METHOD_KEYRING_STORE_KEEP_ALIVE,
  XNFT_GG_LINK,
} from "@coral-xyz/common";
import { Loading } from "@coral-xyz/react-common";
import { useBackgroundClient, useOnboarding } from "@coral-xyz/recoil";

import { SetupComplete } from "../../common/Account/SetupComplete";

export const Finish = ({ isAddingAccount }: { isAddingAccount?: boolean }) => {
  const [loading, setLoading] = useState(true);
  const { onboardingData, maybeCreateUser } = useOnboarding();
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
      const res = await maybeCreateUser({ ...onboardingData, isAddingAccount });
      if (!res.ok) {
        if (
          confirm(
            "There was an issue setting up your account. Please try again."
          )
        ) {
          window.location.reload();
        }
      }
      setLoading(false);
    })();
  }, [onboardingData, isAddingAccount]);

  return !loading ? (
    <SetupComplete
      onClose={() => {
        BrowserRuntimeExtension.closeActiveTab();
        window.open(XNFT_GG_LINK, "_blank");
      }}
    />
  ) : (
    <Loading />
  );
};
