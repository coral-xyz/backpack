import { Suspense } from "react";
import {
  createTheme,
  makeStyles,
  CssBaseline,
  MuiThemeProvider,
} from "@material-ui/core";
import { RecoilRoot } from "recoil";
import { openExpandedExtension, isExtensionPopup } from "../common";
import { Onboarding } from "../components/Onboarding";
import { KeyringStoreStateEnum } from "../keyring/store";
import { Locked } from "../components/Locked";
import { Unlocked } from "../components/Unlocked";
import { Layout } from "../components/Layout";
import { useKeyringStoreState } from "../context/KeyringStoreState";
import { NotificationsProvider } from "../context/Notifications";
import { EXTENSION_WIDTH, EXTENSION_HEIGHT } from "../common";
import "./App.css";
import "@fontsource/inter";

const theme = createTheme({
  palette: {},
  typography: {
    fontFamily: "Inter, sans-serif",
  },
  // @ts-ignore
  custom: {
    colors: {
      background: "#ECEFF3",
      nav: "#ffffff",
      fontColor: "#43546D",
      //      fontColor: "#000000",
      border: "#DBDADB",
      connected: "green",
      disconnected: "red",
      offText: "#636363",
      color: "rgba(0, 0, 0, 0.5)",
      activeNavButton: "#00A2C7",
      hamburger: "#99A4B4",
      scrollbarTrack: "rgba(255, 255, 255, 0.111)",
      scrollbarThumb: "rgb(153 164 180)",
      tabIconBackground: "#99A4B4",
      tabIconSelected: "#1196B5",
      secondary: "rgb(0, 0, 0, .5)",
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
          <Suspense fallback={<BlankApp />}>
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

const useStyles = makeStyles((theme: any) => ({
  blankApp: {
    width: `${EXTENSION_WIDTH}px`,
    height: `${EXTENSION_HEIGHT}px`,
    backgroundColor: theme.custom.colors.background,
  },
}));

function BlankApp() {
  const classes = useStyles();
  return <div className={classes.blankApp}></div>;
}
