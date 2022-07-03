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
  return (
    <RecoilRoot>
      <_Options />
    </RecoilRoot>
  );
}

function _Options() {
  useBackgroundKeepAlive();
  return (
    <WithTheme>
      <WithSuspense>
        <Onboarding />
      </WithSuspense>
    </WithTheme>
  );
}

export default Options;
