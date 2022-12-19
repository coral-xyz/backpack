import React, { useEffect } from "react";
import {
  HashRouter,
  Route,
  Routes,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { WithThemeInner } from "@coral-xyz/react-common";
import { useCustomTheme } from "@coral-xyz/themes";

import { ChatScreen } from "./components/ChatScreen";
import { Inbox } from "./components/Inbox";
import { ProfileScreen } from "./components/ProfileScreen";
import { RequestsScreen } from "./components/RequestsScreen";
import { ParentCommunicationManager } from "./ParentCommunicationManager";

import "./App.css";

function App() {
  return (
    <HashRouter>
      <ThemeContainer />
    </HashRouter>
  );
}

function ThemeContainer() {
  const [searchParams] = useSearchParams();
  const isDarkMode = searchParams.get("isDarkMode") === "true" ? true : false;

  return (
    <WithThemeInner isDarkMode={isDarkMode}>
      <RouterInner isDarkMode={isDarkMode} />
    </WithThemeInner>
  );
}

function RouterInner({ isDarkMode }: { isDarkMode: boolean }) {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const parentUrl = searchParams.get("parentUrl");
  const userId = searchParams.get("userId") || "";
  const uuid = searchParams.get("uuid") || "";
  const username = searchParams.get("username") || "";
  const theme = useCustomTheme();

  useEffect(() => {
    console.error("parent url " + parentUrl);
    if (parentUrl)
      ParentCommunicationManager.getInstance().setParentUrl(parentUrl);
  }, [parentUrl]);

  return (
    <div
      style={{
        height: "100vh",
        background: theme.custom.colors.backgroundBackdrop,
      }}
    >
      <WithThemeInner isDarkMode={isDarkMode}>
        <Routes location={location} key={location.pathname}>
          <Route
            path="/messages/chat"
            element={
              <ChatScreen
                isDarkMode={isDarkMode}
                userId={userId}
                uuid={uuid}
                username={username}
              />
            }
          />
          <Route
            path="/messages/profile"
            element={<ProfileScreen userId={userId} />}
          />
          <Route path="/messages/requests" element={<RequestsScreen />} />
          <Route path="/messages" element={<Inbox />} />
        </Routes>
      </WithThemeInner>
    </div>
  );
}

export default App;
