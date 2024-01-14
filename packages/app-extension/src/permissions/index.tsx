import { createRoot } from "react-dom/client";

import { OptClickToComponent } from "../utils/click-to-component";

import Permissions from "./Permissions";

// Render the UI.
// TOOD(react) createRoot is required: https://reactjs.org/blog/2022/03/08/react-18-upgrade-guide.html#updates-to-client-rendering-apis
const container = document.getElementById("permissions");
const root = createRoot(container!);
root.render(
  <>
    <OptClickToComponent />
    <Permissions />
  </>
);
