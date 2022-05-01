import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./app/App";
import * as background from "./background/client";

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
    </React.StrictMode>,
    document.getElementById("root")
  );
}

main();
