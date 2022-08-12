import React from "react";
import ReactDOM from "react-dom";
import * as cmn from "@coral-xyz/common";
import * as cmnPublic from "@coral-xyz/common-public";
import { privateConfig, publicConfig } from "../config";
import Options from "./Options";

//
// Configure the build.
//
cmn.setConfig(privateConfig);
cmnPublic.setConfigPublic(publicConfig);

//
// Render the UI.
//
ReactDOM.render(
  <React.StrictMode>
    <Options />
  </React.StrictMode>,
  document.getElementById("options")
);
