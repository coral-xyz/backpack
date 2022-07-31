import { Suspense } from "react";
import { RecoilRoot } from "recoil";
import { HashRouter } from "react-router-dom";
import {
  useBackgroundKeepAlive,
  NotificationsProvider,
} from "@coral-xyz/recoil";
import { EXTENSION_WIDTH, EXTENSION_HEIGHT } from "@coral-xyz/common";
import { Router } from "./Router";
import { WithTheme } from "../components/common/WithTheme";
import "./App.css";
import "@fontsource/inter";
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
    <Suspense fallback={<BlankNoTheme />}>
      <WithTheme>
        <NotificationsProvider>
          <Router />
        </NotificationsProvider>
      </WithTheme>
    </Suspense>
  );
}

// Used as a suspense fallback when loading the theme from the background.
function BlankNoTheme() {
  return (
    <div
      style={{
        minWidth: `${EXTENSION_WIDTH}px`,
        minHeight: `${EXTENSION_HEIGHT}px`,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
      }}
    />
  );
}
