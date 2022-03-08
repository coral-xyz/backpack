import { Suspense } from "react";
import { createTheme, CssBaseline, MuiThemeProvider } from "@material-ui/core";
import { RecoilRoot } from "recoil";
import { openExpandedExtension, isExtensionPopup } from "../common";
import { Onboarding } from "../components/Onboarding";
import { KeyringStoreStateEnum } from "../keyring/store";
import { Locked } from "../components/Locked";
import { Unlocked } from "../components/Unlocked";
import { Layout } from "../components/Layout";
import { useKeyringStoreState } from "../context/KeyringStoreState";
import { NotificationsProvider } from "../context/Atoms";
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

export default function App() {
  return (
    <RecoilRoot>
      <NotificationsProvider>
        <MuiThemeProvider theme={theme}>
          <CssBaseline />
          <Suspense fallback={<div></div>}>
            <_App />
          </Suspense>
        </MuiThemeProvider>
      </NotificationsProvider>
    </RecoilRoot>
  );
}

function _App() {
  const keyringStoreState = useKeyringStoreState();

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
