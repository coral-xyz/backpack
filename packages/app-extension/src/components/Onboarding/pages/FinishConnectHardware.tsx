import { useEffect, useState } from "react";
import {
  BrowserRuntimeExtension,
  openPopupWindow,
  XNFT_GG_LINK,
} from "@coral-xyz/common";
import { Loading } from "@coral-xyz/react-common";
import {
  secureUserAtomNullable,
  useBackgroundClient,
  useOnboarding,
} from "@coral-xyz/recoil";
import { useRecoilValue } from "recoil";

import { SetupComplete } from "../../common/Account/SetupComplete";

export const FinishConnectHardware = () => {
  const { onboardingData, createStore, connectHardware } = useOnboarding();
  const background = useBackgroundClient();
  const user = useRecoilValue(secureUserAtomNullable);
  const uuid = user?.user.uuid;
  useEffect(() => {
    (async () => {
      const res = await connectHardware(uuid!, { ...onboardingData });
      if (!res.ok) {
        if (
          confirm("There was an issue adding your wallet. Please try again.")
        ) {
          window.location.reload();
        }
      }
      await openPopupWindow("popup.html");
      window.close();
    })();
  }, [background, onboardingData, createStore, uuid]);

  return <Loading />;
};
