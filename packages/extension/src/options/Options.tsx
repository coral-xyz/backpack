import { RecoilRoot } from "recoil";
import { useBackgroundKeepAlive } from "@coral-xyz/recoil";
import { WithSuspense } from "../app/Router";
import { Onboarding } from "../components/Onboarding";
import "../app/App.css";
import { WithTheme } from "../app/theme";

//
// Options provides the "expanded" extension app flows. Namely,
//
// - Onboarding

function Options() {
  useBackgroundKeepAlive();
  return (
    <RecoilRoot>
      <WithTheme>
        <WithSuspense>
          <Onboarding />
        </WithSuspense>
      </WithTheme>
    </RecoilRoot>
  );
}

export default Options;
