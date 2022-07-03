import React from "react";
import ReactDOM from "react-dom";
import App from "./app/App";
import LedgerIframe from "./components/LedgerIframe";
import "./index.css";

ReactDOM.render(
  <React.StrictMode>
    <App />
    <LedgerIframe />
  </React.StrictMode>,
  document.getElementById("root")
);
