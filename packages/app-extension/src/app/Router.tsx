import { Suspense, useEffect, useState } from "react";
import {
  BACKEND_API_URL,
  EXTENSION_HEIGHT,
  EXTENSION_WIDTH,
  getLogger,
} from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import {
  AlertTriangleIcon,
  StyledText,
  temporarilyMakeStylesForBrowserExtension,
  useTheme,
  XStack,
} from "@coral-xyz/tamagui";

import { Unlocked } from "../components/Unlocked";
import { refreshFeatureGates } from "../gates/FEATURES";

import "./App.css";

const logger = getLogger("router");

export default function Router() {
  const classes = useStyles();
  return (
    <div className={classes.appContainer}>
      <PopupRouter />
      <OfflineBanner />
    </div>
  );
}

function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);
  useEffect(() => {
    const handleOffline = () => setOffline(true);
    const handleOnline = () => setOffline(false);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);
  useEffect(() => {
    // navigator.onLine is unreliable
    fetch(BACKEND_API_URL, { method: "HEAD" }).catch(() => {
      setOffline(true);
    });
  }, []);
  if (!offline) {
    return null;
  }
  return (
    <XStack
      position="absolute"
      width="100%"
      bottom="0px"
      backgroundColor="rgba(206, 121, 7, 0.1)"
      gap="$2"
      padding="$2"
      justifyContent="center"
      alignItems="center"
    >
      <AlertTriangleIcon color="rgb(177, 87, 0)" size="$md" />
      <StyledText fontSize="$sm" color="rgb(177, 87, 0)">
        No internet connection.
      </StyledText>
    </XStack>
  );
}

//
// Router for components that display in the extension popup--distinct from
// the expanded full app view.
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
function PopupRouter() {
  return <FullApp />;
}

function FullApp() {
  logger.debug("full app");
  const background = useBackgroundClient();
  useEffect(() => {
    (async () => {
      await Promise.all([refreshFeatureGates(background)]);
    })();
  }, [background]);

  return <Unlocked />;
}

export function WithSuspense(props: any) {
  return <Suspense fallback={<BlankApp />}>{props.children}</Suspense>;
}

const useStyles = temporarilyMakeStylesForBrowserExtension(() => {
  return {
    appContainer: {
      minWidth: `${EXTENSION_WIDTH}px`,
      minHeight: `${EXTENSION_HEIGHT}px`,
      height: "100%",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      position: "relative",
    },
  };
});

function BlankApp() {
  const classes = useStyles();
  const theme = useTheme();
  return (
    <div
      className={classes.appContainer}
      style={{
        backgroundColor: theme.baseBackgroundL0.val,
      }}
    />
  );
}

export const MOTION_VARIANTS = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: { delay: 0.09 },
  },
  exit: {
    transition: { delay: 0.09, duration: 0.1 },
    opacity: 0,
  },
};
