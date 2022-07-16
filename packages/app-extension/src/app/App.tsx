import { RecoilRoot } from "recoil";
import { HashRouter } from "react-router-dom";
import {
  useBackgroundKeepAlive,
  NotificationsProvider,
} from "@coral-xyz/recoil";
import { WithTheme } from "./theme";
import { Router } from "./Router";
import "./App.css";
import "@fontsource/inter";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";

export default function App() {
  return (
    <HashRouter>
      <RecoilRoot>
        <_App />
      </RecoilRoot>
    </HashRouter>
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
