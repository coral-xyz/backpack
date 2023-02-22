import React from "react";
import { render } from "react-dom";

import Permissions from "./Permissions";

//
// Render the UI TODO(react) v18 requires createRoot
//
const container = document.getElementById("permissions");
render(
  <React.StrictMode>
    <Permissions />
  </React.StrictMode>,
  container
);
