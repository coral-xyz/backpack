import { lazy, Suspense, useEffect, useState } from "react";
import { HashRouter } from "react-router-dom";
import {
  type ApolloClient,
  ApolloProvider,
  type NormalizedCacheObject,
  SuspenseCache,
} from "@apollo/client";
import {
  createApolloClient,
  EXTENSION_HEIGHT,
  EXTENSION_WIDTH,
} from "@coral-xyz/common";
import {
  NotificationsProvider,
  useKeyringStoreState,
  useUser,
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

import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

const BACKDROP_STYLE = {
  height: "100vh",
  minHeight: `${EXTENSION_HEIGHT}px`,
  minWidth: `${EXTENSION_WIDTH}px`,
  background: "red",
};

const suspenseCache = new SuspenseCache();

export default function App() {
  //
  // We use an extra copy of preferences in the local storage backend to avoid
  // hitting the service worker for a slightly faster load time.
  //
  const pStr = window.localStorage.getItem("preferences");
  const preferences = pStr ? JSON.parse(pStr) : {};

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
  useKeyringStoreState();
  const user = useUser();

  const apolloClient = createApolloClient(user.jwt);

  return (
    <ApolloProvider client={apolloClient} suspenseCache={suspenseCache}>
      <NotificationsProvider>
        <ErrorBoundary>
          <_Router />
        </ErrorBoundary>
      </NotificationsProvider>
    </ApolloProvider>
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
