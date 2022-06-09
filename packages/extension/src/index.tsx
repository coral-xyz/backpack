import React from "react";
import ReactDOM from "react-dom";
import { setupClient } from "@200ms/background";
import App from "./app/App";
import LedgerIframe from "./components/LedgerIframe";
import "./index.css";

async function main() {
  //
  // Initialize the client to the background script.
  //
  setupClient();

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
