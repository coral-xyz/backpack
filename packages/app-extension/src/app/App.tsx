import React, { lazy,Suspense } from "react";
import { HashRouter } from "react-router-dom";
import {
  NotificationsProvider,
  useBackgroundKeepAlive,
} from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { RecoilRoot } from "recoil";

import "@fontsource/inter";

import { WithTheme } from "../components/common/WithTheme";

import { ErrorBoundary } from "./ErrorBoundary";
//import { Router } from "./Router";
const Router = lazy(() => import("./Router"));

import "./App.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "react-toastify/dist/ReactToastify.css";

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
          <_Router />
        </ErrorBoundary>
      </NotificationsProvider>
    </WithTheme>
  );
}

function _Router() {
  const theme = useCustomTheme();
  return (
    <Suspense
      fallback={
        <div
          style={{
            height: "100vh",
            minHeight: "600px",
            minWidth: "375px",
            background: theme.custom.colors.backgroundBackdrop,
          }}
        ></div>
      }
    >
      <Router />
    </Suspense>
  );
}
