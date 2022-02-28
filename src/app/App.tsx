import React from "react";
import { EXTENSION_WIDTH, EXTENSION_HEIGHT } from "../common";
import "./App.css";

function App() {
  return (
    <div
      style={{ width: `${EXTENSION_WIDTH}px`, height: `${EXTENSION_HEIGHT}px` }}
    >
      The Anchor Wallet
    </div>
  );
}

export default App;
