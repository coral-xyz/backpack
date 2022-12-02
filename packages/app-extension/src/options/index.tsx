import React from "react";
import ReactDOM from "react-dom";

import LedgerIframe from "../components/LedgerIframe";

import Options from "./Options";

//
// Render the UI.
//
ReactDOM.render(
  <React.StrictMode>
    <Options />
    <LedgerIframe />
  </React.StrictMode>,
  document.getElementById("options")
);
