import React, { useState, useEffect } from "react";
import { createTheme, CssBaseline, MuiThemeProvider } from "@material-ui/core";
import { RecoilRoot } from "recoil";
import { openExpandedExtension, isExtensionPopup } from "../common";
import { Onboarding } from "../components/Onboarding";
import { KeyringStoreState, KeyringStoreStateEnum } from "../keyring/store";
import { Locked } from "../components/Locked";
import { Unlocked } from "../components/Unlocked";
import { Layout } from "../components/Layout";
import "./App.css";

// Define this state setting function so that we can access it from
// the background script notification handler, which allows us to rerender
// components on notifications.
export let _setAppState: null | ((state: KeyringStoreState) => void) = null;

const theme = createTheme({
  palette: {},
  // @ts-ignore
  custom: {
    colors: {
      background: "#1c1c1c",
      fontColor: "#fff",
      border: "#fff",
      connected: "green",
      disconnected: "red",
      offText: "#636363",
    },
  },
  overrides: {},
});

export default function App({ state }: { state: KeyringStoreState }) {
  return (
    <RecoilRoot>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <_App state={state} />
      </MuiThemeProvider>
    </RecoilRoot>
  );
}

function _App({ state }: { state: KeyringStoreState }) {
  const [appState, setAppState] = useState(state);

  useEffect(() => {
    _setAppState = setAppState;
  }, [state]);

  const needsOnboarding = appState === KeyringStoreStateEnum.NeedsOnboarding;
  const isLocked =
    !needsOnboarding && appState === KeyringStoreStateEnum.Locked;

  // Open the extension in an expanded window if we need to onboard.
  if (needsOnboarding) {
    // Check we're not already in the expanded window to avoid an infinite loop.
    if (isExtensionPopup()) {
      openExpandedExtension();
      return <></>;
    } else {
      return <Onboarding />;
    }
  }

  return <Layout>{isLocked ? <Locked /> : <Unlocked />}</Layout>;
}
