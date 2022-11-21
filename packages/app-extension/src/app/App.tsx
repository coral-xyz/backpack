import React from "react";
import { RecoilRoot } from "recoil";
import { HashRouter } from "react-router-dom";
import {
  useBackgroundKeepAlive,
  NotificationsProvider,
} from "@coral-xyz/recoil";
import { Router } from "./Router";
import { WithTheme } from "../components/common/WithTheme";
import "./App.css";
import "@fontsource/inter";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import { ErrorBoundary } from "./ErrorBoundary";

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
