import { Suspense } from "react";
import { makeStyles, CssBaseline, MuiThemeProvider } from "@material-ui/core";
import { RecoilRoot } from "recoil";
import { openExpandedExtension, isExtensionPopup } from "../common";
import { Onboarding } from "../components/Onboarding";
import { KeyringStoreStateEnum } from "../keyring/store";
import { Locked } from "../components/Locked";
import { Unlocked } from "../components/Unlocked";
import { useKeyringStoreState } from "../hooks/useKeyringStoreState";
import { NotificationsProvider } from "../context/Notifications";
import { EXTENSION_WIDTH, EXTENSION_HEIGHT } from "../common";
import { useDarkMode } from "../hooks/useDarkMode";
import { darkTheme, lightTheme } from "./theme";
import { useBootstrapFast } from "../hooks/useWallet";
import "./App.css";
import "@fontsource/inter";

const useStyles = makeStyles((theme: any) => ({
  appContainer: {
    width: `${EXTENSION_WIDTH}px`,
    height: `${EXTENSION_HEIGHT}px`,
    backgroundColor: theme.custom.colors.background,
    display: "flex",
    flexDirection: "column",
  },
}));

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
        <Suspense fallback={<BlankApp />}>
          <__App />
        </Suspense>
      </MuiThemeProvider>
    </NotificationsProvider>
  );
}

function __App() {
  const classes = useStyles();
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

  return (
    <div className={classes.appContainer}>
      {isLocked ? <LockedBootstrap /> : <Unlocked />}
    </div>
  );
}

function LockedBootstrap() {
  useBootstrapFast();
  return <Locked />;
}

function BlankApp() {
  const classes = useStyles();
  return <div className={classes.appContainer}></div>;
}
