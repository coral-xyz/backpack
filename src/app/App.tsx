import React from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import { MuiThemeProvider } from "@material-ui/core/styles";
import { createTheme } from "@material-ui/core/styles";
import {
  openExpandedExtension,
  isExtensionPopup,
  EXTENSION_WIDTH,
  EXTENSION_HEIGHT,
} from "../common";
import { Onboarding } from "../components/Onboarding";
import { KeyringStoreState, KeyringStoreStateEnum } from "../keyring/store";
import "./App.css";

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

export default function App({ state }: { state: KeyringStoreState }) {
  const needsOnboarding = state === KeyringStoreStateEnum.NeedsOnboarding;
  const isLocked = !needsOnboarding && state === KeyringStoreStateEnum.Locked;
  const isUnlocked = !needsOnboarding && !isLocked;

  // Open the extension in an expanded window if we need to onboard.
  if (needsOnboarding) {
    // Check we're not already in the expanded window to avoid an infinite loop.
    if (isExtensionPopup()) {
      openExpandedExtension();
      return <></>;
    }
  }

  return (
    <div
      style={{ width: `${EXTENSION_WIDTH}px`, height: `${EXTENSION_HEIGHT}px` }}
    >
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {needsOnboarding && <Onboarding />}
        {isLocked && <Locked />}
        {isUnlocked && <Wallet />}
      </MuiThemeProvider>
    </div>
  );
}

function Wallet() {
  return <div>200ms wallet yay</div>;
}

function Locked() {
  return <div>Locked yay!</div>;
}
