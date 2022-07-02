import React from "react";
import ReactDOM from "react-dom";
import { setupBackgroundClientAppUi } from "@coral-xyz/common";
import App from "./app/App";
import LedgerIframe from "./components/LedgerIframe";
import "./index.css";

async function main() {
  //
  // Initialize the client to the background script.
  //
  setupBackgroundClientAppUi();

  //
  // Render the UI.
  //
  render();
}

function render() {
  ReactDOM.render(
    <React.StrictMode>
      <App />
      <LedgerIframe />
    </React.StrictMode>,
    document.getElementById("root")
  );
}

main();

// module?.hot?.accept();
