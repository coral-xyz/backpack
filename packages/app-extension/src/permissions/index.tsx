import React from "react";
import { render } from "react-dom";

import Permissions from "./Permissions";

// Render the UI.
// TOOD(react) createRoot is required: https://reactjs.org/blog/2022/03/08/react-18-upgrade-guide.html#updates-to-client-rendering-apis
const container = document.getElementById("permissions");
render(
  <React.StrictMode>
    <Permissions />
  </React.StrictMode>,
  container
);
