import { useEffect, useState } from "react";
import { BrowserRuntimeExtension, XNFT_GG_LINK } from "@coral-xyz/common";
import { Loading } from "@coral-xyz/react-common";
import { useBackgroundClient, useOnboarding } from "@coral-xyz/recoil";

import { SetupComplete } from "../../common/Account/SetupComplete";

export const Finish = ({ isAddingAccount }: { isAddingAccount?: boolean }) => {
  const [loading, setLoading] = useState(true);
  const { onboardingData, createStore } = useOnboarding();
  const background = useBackgroundClient();

  useEffect(() => {
    if (onboardingData.action === "recover_backpack_backup") {
      setLoading(false);
      return;
    }
    (async () => {
      const res = await createStore({ ...onboardingData, isAddingAccount });
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
  }, [background, isAddingAccount, onboardingData, createStore]);

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
