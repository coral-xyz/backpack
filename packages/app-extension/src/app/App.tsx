import React from "react";
import { HashRouter } from "react-router-dom";
import { WithTheme } from "@coral-xyz/react-common";
import {
  NotificationsProvider,
  useBackgroundKeepAlive,
} from "@coral-xyz/recoil";
import { RecoilRoot } from "recoil";

import "@fontsource/inter";

import { ErrorBoundary } from "./ErrorBoundary";
import { Router } from "./Router";

import "./App.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";

export default function App() {
  return (
    <div
      style={{
        height: "100vh",
        minHeight: "600px",
        minWidth: "375px",
      }}
    >
      <HashRouter>
        <RecoilRoot>
          <_App />
        </RecoilRoot>
      </HashRouter>
    </div>
  );
}

function _App() {
  useBackgroundKeepAlive();
  return (
    <WithTheme>
      <NotificationsProvider>
        <ErrorBoundary>
          <Router />
        </ErrorBoundary>
      </NotificationsProvider>
    </WithTheme>
  );
}
