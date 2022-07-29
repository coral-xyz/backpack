import { RecoilRoot } from "recoil";
import { HashRouter } from "react-router-dom";
import {
  useBackgroundKeepAlive,
  NotificationsProvider,
  useDarkMode,
} from "@coral-xyz/recoil";
import { WithTheme } from "@coral-xyz/themes";
import { Router } from "./Router";
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
    <WithTheme>
      <NotificationsProvider>
        <Router />
      </NotificationsProvider>
    </WithTheme>
  );
}
