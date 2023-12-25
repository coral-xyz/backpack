import { MemoryRouter } from "react-router-dom";
import {
  Blockchain,
  QUERY_ADD_USER_ACCOUNT,
  QUERY_CONNECT_HARDWARE,
  QUERY_ONBOARDING,
} from "@coral-xyz/common";
import {
  notificationListenerAtom,
  NotificationsProvider,
  secureBackgroundSenderAtom,
} from "@coral-xyz/recoil";
import type {
  TransportBroadcastListener,
  TransportSender,
} from "@coral-xyz/secure-background/types";
import { RequireUserUnlocked } from "@coral-xyz/secure-ui";
import { RecoilRoot } from "recoil";

import { WithSuspense } from "../app/Router";
import { WithTheme } from "../components/common/WithTheme";
import { Onboarding, OptionsContainer } from "../components/Onboarding";

import "../app/App.css";

//
// Options provides the "expanded" extension app flows. Namely,
//
// - Onboarding
// - Connect to hardware
//
function Options({
  transportSender,
  notificationListener,
}: {
  transportSender: TransportSender;
  notificationListener: TransportBroadcastListener;
}) {
  return (
    <MemoryRouter>
      <RecoilRoot
        initializeState={({ set }) => {
          set(secureBackgroundSenderAtom, transportSender);
          set(notificationListenerAtom, notificationListener);
        }}
      >
        <_Options />
      </RecoilRoot>
    </MemoryRouter>
  );
}

function _Options() {
  return (
    <WithTheme>
      <WithSuspense>
        <NotificationsProvider />
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
    case QUERY_ONBOARDING:
      return <Onboarding />;
    case QUERY_ADD_USER_ACCOUNT:
      return <Onboarding isAddingAccount />;
    default:
      throw new Error("invalid query param");
  }
}

export default Options;
