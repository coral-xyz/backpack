import { useState } from "react";
import { openPopupWindow } from "@coral-xyz/common";
import { useOnboarding } from "@coral-xyz/recoil";
import { Loader } from "@coral-xyz/tamagui";
import { useAsyncEffect } from "use-async-effect";

import { SetupComplete } from "../../common/Account/SetupComplete";

export const Finish = ({ isAddingAccount }: { isAddingAccount?: boolean }) => {
  const [loading, setLoading] = useState(true);
  const { onboardingData, createStore } = useOnboarding();

  useAsyncEffect(async () => {
    try {
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
    } catch (err: any) {
      console.error("failed to create store", err.message);
    } finally {
      setLoading(false);
    }
  }, [isAddingAccount, onboardingData, createStore, setLoading]);

  return !loading ? (
    <SetupComplete
      onClose={() => {
        window.open("https://backpack.exchange", "_blank");
        openPopupWindow("popup.html");
      }}
    />
  ) : (
    <Loader />
  );
};
