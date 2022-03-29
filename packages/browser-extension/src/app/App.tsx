import { Suspense } from "react";
import { makeStyles, CssBaseline, MuiThemeProvider } from "@material-ui/core";
import { RecoilRoot } from "recoil";
import { openExpandedExtension, isExtensionPopup, debug } from "../common";
import { Onboarding } from "../components/Onboarding";
import { KeyringStoreStateEnum } from "../keyring/store";
import { Locked } from "../components/Locked";
import { Unlocked } from "../components/Unlocked";
import {
  useKeyringStoreState,
  useApprovedOrigins,
} from "../hooks/useKeyringStoreState";
import { NotificationsProvider } from "../context/Notifications";
import { EXTENSION_WIDTH, EXTENSION_HEIGHT } from "../common";
import { useDarkMode } from "../hooks/useDarkMode";
import { darkTheme, lightTheme } from "./theme";
import { useBootstrapFast } from "../hooks/useWallet";
import {
  QUERY_LOCKED,
  QUERY_APPROVAL,
  QUERY_LOCKED_APPROVAL,
  QUERY_APPROVE_TRANSACTION,
  QUERY_APPROVE_MESSAGE,
} from "../common";
import {
  Approval,
  ApproveTransaction,
  ApproveMessage,
} from "../components/Approval";
import "./App.css";
import "@fontsource/inter";
import { getBackgroundResponseClient } from "../background/client";

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

  //
  // Open the extension in an expanded window if we need to onboard.
  //
  const needsOnboarding =
    useKeyringStoreState() === KeyringStoreStateEnum.NeedsOnboarding;
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
      <AppRouter />
    </div>
  );
}

//
// Query paramaters determines the app flow. There are four cases.
//
// 1) There is no query parameter. In this case, the extension is being
//    opened from the browser toolbar. This is the normal path and we simply
//    show the normal app.
// 2) There is a "locked" query parameter. This means an app is trying to
//    connect, and has been previously been approved. But the wallet is locked
//    so we provide the ability to unlock and nothing more.
// 3) There is a "approval" parameter. This means the app is trying to
//    connect, and the wallet is unlocked. But has not been previously approved.
//    So we provide the ability to approve the app and nothing more.
// 4) There is a "locked-approval" query parameter. This combines 2) and 3).
//    First we provide the ability to unlock the wallet, and then approve.
//
function AppRouter() {
  debug("app router search", window.location.search);

  // Chop off the `?` if needed.
  const search =
    window.location.search.length > 0
      ? window.location.search.substring(1)
      : "";

  // Render the 4 app flows described above.
  switch (search.split("&")[0]) {
    case QUERY_LOCKED:
      return <QueryLocked />;
    case QUERY_APPROVAL:
      return <QueryApproval />;
    case QUERY_LOCKED_APPROVAL:
      return <QueryLockedApproval />;
    case QUERY_APPROVE_TRANSACTION:
      return <QueryApproveTransaction />;
    case QUERY_APPROVE_MESSAGE:
      return <QueryApproveMessage />;
    default:
      return <FullApp />;
  }
}

function QueryLockedApproval() {
  debug("query locked approval");
  const keyringStoreState = useKeyringStoreState();
  const isLocked = keyringStoreState === KeyringStoreStateEnum.Locked;
  return isLocked ? <LockedBootstrap /> : <QueryApproval />;
}

function QueryLocked() {
  debug("query locked");
  const url = new URL(window.location.href);
  const requestId = parseInt(url.searchParams.get("requestId")!);

  const keyringStoreState = useKeyringStoreState();
  const isLocked = keyringStoreState === KeyringStoreStateEnum.Locked;

  // Wallet is unlocked so close the window. We're done.
  if (!isLocked) {
    return <></>;
  }
  return (
    <LockedBootstrap onUnlock={() => connectFlowDidComplete(requestId, true)} />
  );
}

function QueryApproval() {
  debug("query approval");
  const url = new URL(window.location.href);
  const origin = url.searchParams.get("origin");
  const requestId = parseInt(url.searchParams.get("requestId")!);

  const approvedOrigins = useApprovedOrigins();
  const found = approvedOrigins.find((ao) => ao === origin);

  // Origin is found so close the window. We're done.
  if (found) {
    return <></>;
  }
  return (
    <Approval
      origin={origin}
      onCompletion={(didApprove: boolean) =>
        connectFlowDidComplete(requestId, didApprove)
      }
    />
  );
}

function QueryApproveTransaction() {
  debug("query approve transaction");

  const url = new URL(window.location.href);
  const origin = url.searchParams.get("origin");
  const requestId = parseInt(url.searchParams.get("requestId")!);
  const tx = url.searchParams.get("tx");

  return (
    <ApproveTransaction
      tx={tx}
      origin={origin}
      onCompletion={(didApprove: boolean) => {
        approveFlowDidComplete(requestId, didApprove);
      }}
    />
  );
}

function QueryApproveMessage() {
  debug("query approve transaction");

  const url = new URL(window.location.href);
  const origin = url.searchParams.get("origin");
  const requestId = parseInt(url.searchParams.get("requestId")!);
  const message = url.searchParams.get("message");

  return (
    <ApproveMessage
      message={message}
      origin={origin}
      onCompletion={(didApprove: boolean) => {
        approveFlowDidComplete(requestId, didApprove);
      }}
    />
  );
}

function FullApp() {
  debug("full app");
  const keyringStoreState = useKeyringStoreState();
  const needsOnboarding =
    keyringStoreState === KeyringStoreStateEnum.NeedsOnboarding;
  const isLocked =
    !needsOnboarding && keyringStoreState === KeyringStoreStateEnum.Locked;
  return isLocked ? <LockedBootstrap /> : <Unlocked />;
}

function LockedBootstrap({ onUnlock }: any) {
  useBootstrapFast();
  return <Locked onUnlock={onUnlock} />;
}

function BlankApp() {
  const classes = useStyles();
  return <div className={classes.appContainer}></div>;
}

// Invoked at the end of a connection flow. Triggers a notification to be sent
// from the UI -> background script -> injected script and subsequently closes
// the window.
async function connectFlowDidComplete(requestId: number, result: boolean) {
  const background = getBackgroundResponseClient();
  await background.response({
    id: requestId,
    result,
  });
  // Must close *after* the above request goes through so that the notification
  // can be relayed to the injected scrpit.
  window.close();
}

async function approveFlowDidComplete(requestId: number, result: boolean) {
  const respClient = getBackgroundResponseClient();
  await respClient.response({
    id: requestId,
    result,
  });
  window.close();
}
