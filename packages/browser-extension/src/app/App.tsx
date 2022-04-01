import { CssBaseline, MuiThemeProvider } from "@material-ui/core";
import { RecoilRoot } from "recoil";
import { NotificationsProvider } from "../context/Notifications";
import { useDarkMode } from "../hooks/useDarkMode";
import { darkTheme, lightTheme } from "./theme";
import { Router } from "./Router";
import "./App.css";
import "@fontsource/inter";

export default function App() {
  return (
    <RecoilRoot>
      <_App />
    </RecoilRoot>
  );
}

function _App() {
  const isDarkMode = useDarkMode();
  const theme = isDarkMode ? darkTheme : lightTheme;
  return (
    <NotificationsProvider>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <Router />
      </MuiThemeProvider>
    </NotificationsProvider>
  );
}
