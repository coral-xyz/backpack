import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./app/App";
import reportWebVitals from "./reportWebVitals";
import * as background from "./background/client";
import LedgerIframe from "./components/LedgerIframe";

async function main() {
  //
  // Initialize the client to the background script.
  //
  background.setupClient();

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

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
