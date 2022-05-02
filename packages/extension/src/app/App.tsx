import { RecoilRoot } from "recoil";
import { BrowserRouter } from "react-router-dom";
import { NotificationsProvider } from "@200ms/recoil";
import { WithTheme } from "./theme";
import { Router } from "./Router";
import "./App.css";
import "@fontsource/inter";

export default function App() {
  return (
    <BrowserRouter basename={"/popup.html"}>
      <RecoilRoot>
        <_App />
      </RecoilRoot>
    </BrowserRouter>
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
