import { RecoilRoot } from "recoil";
import { setupClient } from "@coral-xyz/common";
import { WithSuspense } from "../app/Router";

import { Onboarding } from "../components/Onboarding";
import "../app/App.css";
import { WithTheme } from "../app/theme";

//
// Options provides the "expanded" extension app flows. Namely,
//
// - Onboarding

function Options() {
  setupClient();
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
