import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./app/App";
import { setupClient } from "./background/client";
import LedgerIframe from "./components/LedgerIframe";

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
