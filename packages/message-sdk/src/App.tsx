import React from "react";
import { WithThemeInner } from "@coral-xyz/react-common";

import { Inbox } from "./components/Inbox";

import "./App.css";

function App() {
  return (
    // <RecoilRoot>
    <WithThemeInner isDarkMode={false}>
      <Inbox />
    </WithThemeInner>
    // </RecoilRoot>
  );
}

export default App;
