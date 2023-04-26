import { useEffect, useState } from "react";
import { BrowserRuntimeExtension, XNFT_GG_LINK } from "@coral-xyz/common";
import { Loading } from "@coral-xyz/react-common";
import {
  useBackgroundClient,
  useKeyringStoreState,
  useOnboarding,
} from "@coral-xyz/recoil";

import {
  registerNotificationServiceWorker,
  saveSubscription,
} from "../../../permissions/utils";
import { SetupComplete } from "../../common/Account/SetupComplete";

export const Finish = ({ isAddingAccount }: { isAddingAccount?: boolean }) => {
  // This is a mitigation to ensure the keyring store doesn't lock before
  // creating the user on the server.
  //
  // Would be better (though probably not a priority atm) to ensure atomicity.
  // E.g. we could generate the UUID here on the client, create the keyring store,
  // and only then create the user on the server. If the server fails, then
  // rollback on the client.
  //
  // An improvement for the future!
  useKeyringStoreState();
  const [loading, setLoading] = useState(true);
  const { onboardingData, maybeCreateUser } = useOnboarding();
  const background = useBackgroundClient();

  const registerSubscription = async () => {
    try {
      const sub = await registerNotificationServiceWorker();
      if (!sub) {
        // Set appropriate app states
        return;
      }
      await saveSubscription(sub);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    (async () => {
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
      registerSubscription();
      setLoading(false);
    })();
  }, [background, isAddingAccount, onboardingData, maybeCreateUser]);

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
