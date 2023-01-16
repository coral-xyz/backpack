import { Router } from "../common/Layout/Router";
import { WithTabs } from "../common/Layout/Tab";

import { ApproveTransactionRequest } from "./ApproveTransactionRequest";

//
// The main nav persistent stack.
//
export function Unlocked() {
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
      </div>
    </WithTabs>
  );
}
