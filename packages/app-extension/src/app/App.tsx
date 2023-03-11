import { lazy, Suspense, useLayoutEffect } from "react";
import { HashRouter } from "react-router-dom";
import { EXTENSION_HEIGHT, EXTENSION_WIDTH } from "@coral-xyz/common";
import {
  NotificationsProvider,
  useBackgroundKeepAlive,
} from "@coral-xyz/recoil";
import {
  BACKGROUND_BACKDROP_COLOR,
  LIGHT_BACKGROUND_BACKDROP_COLOR,
  useCustomTheme,
} from "@coral-xyz/themes";
import { RecoilRoot } from "recoil";

import "@fontsource/inter";

import { WithTheme } from "../components/common/WithTheme";

import { ErrorBoundary } from "./ErrorBoundary";

const Router = lazy(() => import("./Router"));

import "./App.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "react-toastify/dist/ReactToastify.css";

const BACKDROP_STYLE = {
  height: "100vh",
  minHeight: `${EXTENSION_HEIGHT}px`,
  minWidth: `${EXTENSION_WIDTH}px`,
  background: "red",
};

export default function App() {
  //
  // We use an extra copy of preferences in the local storage backend to avoid
  // hitting the service worker for a slightly faster load time.
  //
  const pStr = window.localStorage.getItem("preferences");
  const preferences = pStr ? JSON.parse(pStr) : {};

  useLayoutEffect(() => {
    console.log(`
                      d####b
                   d##########b

                d################b
            d#######################b
          d###########^''''^##########b
         d##########b        d##########b
        d##########b          d##########b
        ############b        d############
        ##############b....d##############
        ##################################
        ##################################
        ##################################
        ##################################
         ################################

         ################################
        ##################################
        ##################################
        ##################################
        ##################################
         ################################

         Backpack - A home for your xNFTs

              https://backpack.app
       https://github.com/coral-xyz/backpack

  DO NOT COPY OR PASTE ANYTHING AS INSTRUCTED BY 
             ANOTHER PERSON IN HERE!
`);
  }, []);

  return (
    <div
      style={{
        ...BACKDROP_STYLE,
        background: preferences?.darkMode
          ? BACKGROUND_BACKDROP_COLOR
          : LIGHT_BACKGROUND_BACKDROP_COLOR,
      }}
    >
      <HashRouter>
        <RecoilRoot>
          <WithTheme>
            <_App />
          </WithTheme>
        </RecoilRoot>
      </HashRouter>
    </div>
  );
}

function _App() {
  useBackgroundKeepAlive();
  return (
    <NotificationsProvider>
      <ErrorBoundary>
        <_Router />
      </ErrorBoundary>
    </NotificationsProvider>
  );
}

function _Router() {
  const theme = useCustomTheme();
  return (
    <Suspense
      fallback={
        <div
          style={{
            ...BACKDROP_STYLE,
            background: theme.custom.colors.backgroundBackdrop,
          }}
        />
      }
    >
      <Router />
    </Suspense>
  );
}
