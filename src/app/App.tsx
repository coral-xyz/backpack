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
import { useDarkMode } from "../hooks/useDarkMode";
import "./App.css";
import "@fontsource/inter";

const lightTheme = createTheme({
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
      border: "#DBDADB",
      activeNavButton: "#00A2C7",
      hamburger: "#99A4B4",
      scrollbarThumb: "rgb(153 164 180)",
      tabIconBackground: "#99A4B4",
      tabIconSelected: "#1196B5",
      secondary: "#67758B",
      positive: "#19A51E",
      negative: "#E31B1B",
      onboardButton: "#07758E",
      sendGradient:
        "linear-gradient(180deg, #1B1D23 0%, rgba(27, 29, 35, 0) 100%)", // todo
      interactiveIconsActive: "#1196B5",
    },
  },
});

const darkTheme = createTheme({
  palette: {},
  typography: {
    fontFamily: "Inter, sans-serif",
  },
  // @ts-ignore
  custom: {
    colors: {
      background: "#1B1D23",
      nav: "#292C33",
      fontColor: "#FFFFFF",
      border: "#393C43",
      activeNavButton: "#24B0D0",
      //			activeNavButton: "#7dffd0",
      //			activeNavButton: '#ff62eb',
      hamburger: "#99A4B4",
      scrollbarThumb: "rgb(153 164 180)",
      tabIconBackground: "#99A4B4",
      tabIconSelected: "#24B0D0",
      //			tabIconSelected: '#ff62eb',
      secondary: "#99A4B4",
      positive: "#35A63A",
      negative: "#E95050",
      onboardButton: "#07758E",
      sendGradient:
        "linear-gradient(180deg, #1B1D23 0%, rgba(27, 29, 35, 0) 100%)",
      swapGradient:
        "linear-gradient(180deg, #292C33 0%, rgba(41, 44, 51, 0) 100%)",
      interactiveIconsActive: "#1196B5",
    },
  },
});

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
