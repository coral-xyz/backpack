import React from "react";
import ReactDOM from "react-dom";
import Options from "./Options";
import LedgerIframe from "../components/LedgerIframe";

//
// Render the UI.
//
ReactDOM.render(
  <React.StrictMode>
    <Options />
  </React.StrictMode>,
  document.getElementById("options")
);
