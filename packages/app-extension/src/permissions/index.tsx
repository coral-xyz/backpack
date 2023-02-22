import React from "react";
import { createRoot } from "react-dom/client";

import Permissions from "./Permissions";

//
// Render the UI.
//
const container = document.getElementById("permissions");
const root = createRoot(container!);
root.render(
    <Permissions />
);
