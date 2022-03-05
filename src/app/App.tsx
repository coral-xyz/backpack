import React from "react";
import { createTheme, CssBaseline, MuiThemeProvider } from "@material-ui/core";
import { RecoilRoot } from "recoil";
import { openExpandedExtension, isExtensionPopup } from "../common";
import { Onboarding } from "../components/Onboarding";
import { KeyringStoreState, KeyringStoreStateEnum } from "../keyring/store";
import { Locked } from "../components/Locked";
import { Layout } from "../components/Layout";
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
        <_App state={state} />
      </MuiThemeProvider>
    </RecoilRoot>
  );
}

function _App({ state }: { state: KeyringStoreState }) {
  const needsOnboarding = state === KeyringStoreStateEnum.NeedsOnboarding;
  const isLocked = !needsOnboarding && state === KeyringStoreStateEnum.Locked;

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

  return <Layout>{isLocked ? <Locked /> : <Wallet />}</Layout>;
}

function Wallet() {
  return <div>200ms wallet yay</div>;
}
