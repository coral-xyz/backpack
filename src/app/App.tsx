import React from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import { MuiThemeProvider } from "@material-ui/core/styles";
import { createTheme } from "@material-ui/core/styles";
import {
  openExpandedExtension,
  PortChannelClient,
  EXTENSION_WIDTH,
  EXTENSION_HEIGHT,
} from "../common";
import { Onboarding } from "../components/Onboarding";
import "./App.css";

let _backgroundClient: PortChannelClient | null = null;

export function setBackgroundClient(backgroundClient: PortChannelClient) {
  _backgroundClient = backgroundClient;
}

const theme = createTheme({
  palette: {},
  // @ts-ignore
  custom: {
    colors: {
      background: "#1c1c1c",
      fontColor: "#fff",
    },
  },
  overrides: {},
});

export function isExtensionPopup() {
  // A bit of a hack, but we want to know this *on click*  of the extension
  // button and so the dimensions can be smaller since the view hasn't loaded.
  return (
    window.innerWidth <= EXTENSION_WIDTH &&
    window.innerHeight <= EXTENSION_HEIGHT
  );
}

export default function App() {
  console.log(
    "window",
    window.innerWidth,
    window.innerHeight,
    isExtensionPopup()
  );
  if (isExtensionPopup()) {
    openExpandedExtension();
    return <></>;
  }
  return (
    <div
      style={{ width: `${EXTENSION_WIDTH}px`, height: `${EXTENSION_HEIGHT}px` }}
    >
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <Onboarding />
      </MuiThemeProvider>
    </div>
  );
}
