import { ApproveTransactionRequest } from "../../Unlocked/ApproveTransactionRequest";
import { DisplayPlugin } from "../../Unlocked/DisplayPlugin";

import { Router } from "./Router";
import { WithTabs } from "./Tab";

// TODO(peter) figure out ApproveTransactionRequest functionality and whether we need to do the same thign

//
// The main nav persistent stack.
//
export function NavTabs() {
  return (
    <WithTabs>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Router />
        <ApproveTransactionRequest />
        <DisplayPlugin />
      </div>
    </WithTabs>
  );
}
