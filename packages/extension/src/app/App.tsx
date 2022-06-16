import { RecoilRoot } from "recoil";
import { HashRouter } from "react-router-dom";
import { NotificationsProvider } from "@coral-xyz/recoil";
import { WithTheme } from "./theme";
import { Router } from "./Router";
import "./App.css";

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
  return (
    <WithTheme>
      <NotificationsProvider>
        <Router />
      </NotificationsProvider>
    </WithTheme>
  );
}
