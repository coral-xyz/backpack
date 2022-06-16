import { RecoilRoot } from "recoil";
import {
  setupClient,
  QUERY_CONNECT_HARDWARE,
  QUERY_ONBOARDING,
} from "@coral-xyz/common";
import { WithSuspense } from "../app/Router";
import { WithTheme } from "../app/theme";
import { ConnectHardware } from "../components/Settings/ConnectHardware";
import { Onboarding } from "../components/Onboarding";
import "../app/App.css";

//
// Options provides the "expanded" extension app flows. Namely,
//
// - Onboarding
// - Connect to hardware
//
function Options() {
  setupClient();
  return (
    <RecoilRoot>
      <_Options />
    </RecoilRoot>
  );
}

function _Options() {
  return (
    <WithTheme>
      <WithSuspense>
        <Router />
      </WithSuspense>
    </WithTheme>
  );
}

function Router() {
  //
  // Extract the url query parameters for routing dispatch.
  //
  const search =
    window.location.search.length > 0
      ? window.location.search.substring(1)
      : "";
  const query = search.split("&")[0];

  switch (query) {
    case QUERY_CONNECT_HARDWARE:
      return <ConnectHardware />;
    case QUERY_ONBOARDING:
      return <Onboarding />;
    default:
      throw new Error("invalid query param");
  }
}

export default Options;
