import { RecoilRoot } from "recoil";
import { HashRouter } from "react-router-dom";
import { QUERY_CONNECT_HARDWARE, QUERY_ONBOARDING } from "@coral-xyz/common";
import {
  useBackgroundKeepAlive,
  NotificationsProvider,
} from "@coral-xyz/recoil";
import { WithSuspense } from "../app/Router";
import { ConnectHardware } from "../components/Unlocked/Settings/AddConnectWallet/ConnectHardware";
import { Onboarding } from "../components/Onboarding";
import "../app/App.css";
import { WithTheme } from "../components/common/WithTheme";

//
// Options provides the "expanded" extension app flows. Namely,
//
// - Onboarding
// - Connect to hardware
//
function Options() {
  return (
    <HashRouter>
      <RecoilRoot>
        <_Options />
      </RecoilRoot>
    </HashRouter>
  );
}

function _Options() {
  useBackgroundKeepAlive();
  return (
    <WithTheme>
      <NotificationsProvider>
        <WithSuspense>
          <Router />
        </WithSuspense>
      </NotificationsProvider>
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
      return <ConnectHardware onComplete={window.close} />;
    case QUERY_ONBOARDING:
      return <Onboarding />;
    default:
      throw new Error("invalid query param");
  }
}

export default Options;
