import React, { useState, useEffect } from "react";
import { createTheme, CssBaseline, MuiThemeProvider } from "@material-ui/core";
import { RecoilRoot } from "recoil";
import { openExpandedExtension, isExtensionPopup } from "../common";
import { Onboarding } from "../components/Onboarding";
import { KeyringStoreState, KeyringStoreStateEnum } from "../keyring/store";
import { Locked } from "../components/Locked";
import { Unlocked } from "../components/Unlocked";
import { Layout } from "../components/Layout";
import {
  KeyringStoreStateProvider,
  useKeyringStoreStateContext,
} from "../context/KeyringStoreState";
import "./App.css";

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
        <KeyringStoreStateProvider keyringStoreState={state}>
          <_App state={state} />
        </KeyringStoreStateProvider>
      </MuiThemeProvider>
    </RecoilRoot>
  );
}

function _App({ state }: { state: KeyringStoreState }) {
  const { keyringStoreState } = useKeyringStoreStateContext();

  const needsOnboarding =
    keyringStoreState === KeyringStoreStateEnum.NeedsOnboarding;
  const isLocked =
    !needsOnboarding && keyringStoreState === KeyringStoreStateEnum.Locked;

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
