import { lazy, Suspense, useEffect } from "react";
import { HashRouter } from "react-router-dom";
import { EXTENSION_HEIGHT, EXTENSION_WIDTH } from "@coral-xyz/common";
import {
  notificationListenerAtom,
  NotificationsProvider,
  secureBackgroundSenderAtom,
  userClientAtom,
} from "@coral-xyz/recoil";
import { RecoilRoot, useRecoilValue, useRecoilValueLoadable } from "recoil";

import { WithTheme } from "../components/common/WithTheme";

import { ErrorBoundary } from "./ErrorBoundary";

const Router = lazy(() => import("./Router"));

import type {
  TransportBroadcastListener,
  TransportSender,
} from "@coral-xyz/secure-clients/types";
import { useTheme } from "@coral-xyz/tamagui";

import "@fontsource/inter";

import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "./App.css";

const BACKDROP_STYLE = {
  height: "100vh",
  minHeight: `${EXTENSION_HEIGHT}px`,
  minWidth: `${EXTENSION_WIDTH}px`,
};

export default function App({
  secureBackgroundSender,
  notificationListener,
}: {
  secureBackgroundSender: TransportSender;
  notificationListener: TransportBroadcastListener;
}) {
  //
  // We use an extra copy of preferences in the local storage backend to avoid
  // hitting the service worker for a slightly faster load time.
  //
  // const pStr = window.localStorage.getItem("secureUser");
  // const preferences = pStr ? JSON.parse(pStr).preferences : {};
  return (
    <div
      style={{
        ...BACKDROP_STYLE,
        background: "rgba(14, 15, 20, 1)", // baseBackgroundL0
      }}
    >
      <HashRouter>
        <RecoilRoot
          initializeState={({ set }) => {
            set(secureBackgroundSenderAtom, secureBackgroundSender);
            set(notificationListenerAtom, notificationListener);
          }}
        >
          <WithTheme>
            <_App />
          </WithTheme>
        </RecoilRoot>
      </HashRouter>
    </div>
  );
}

function _App() {
  return (
    <>
      <NotificationsProvider />
      <ErrorBoundary>
        <_Router />
      </ErrorBoundary>
    </>
  );
}

function _Router() {
  const theme = useTheme();
  return (
    <Suspense
      fallback={
        <div
          style={{
            ...BACKDROP_STYLE,
            background: theme.baseBackgroundL0.val,
          }}
        />
      }
    >
      <Router />
    </Suspense>
  );
}
