import { WithTabs } from "./Tab";
import { ApproveTransactionRequest } from "../Unlocked/ApproveTransactionRequest";
import { Router } from "./Router";

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
      </div>
    </WithTabs>
  );
}
