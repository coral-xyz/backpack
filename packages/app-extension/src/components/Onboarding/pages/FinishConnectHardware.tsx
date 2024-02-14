import { openPopupWindow } from "@coral-xyz/common";
import {
  secureUserAtomNullable,
  useBackgroundClient,
  useOnboarding,
} from "@coral-xyz/recoil";
import { Loader } from "@coral-xyz/tamagui";
import { useRecoilValue } from "recoil";
import useAsyncEffect from "use-async-effect";

export const FinishConnectHardware = () => {
  const { onboardingData, createStore, connectHardware } = useOnboarding();
  const background = useBackgroundClient();
  const user = useRecoilValue(secureUserAtomNullable);
  const uuid = user?.user.uuid;

  useAsyncEffect(async () => {
    const res = await connectHardware(uuid!, { ...onboardingData });
    if (!res.ok) {
      if (confirm("There was an issue adding your wallet. Please try again.")) {
        window.location.reload();
      }
    }
    await openPopupWindow("popup.html");
    window.close();
  }, [background, onboardingData, createStore, uuid]);

  return <Loader />;
};
