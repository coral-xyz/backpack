import React from "react";
import { WithTheme } from "@coral-xyz/react-common";

import { Inbox } from "./components/Inbox";

import "./App.css";

function App() {
  return (
    <WithTheme>
      <div className="App">
        <header className="App-header">
          <Inbox />
        </header>
      </div>
    </WithTheme>
  );
}

export default App;
