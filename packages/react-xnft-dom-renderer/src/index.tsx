import ReactDOM from "react-dom";

import { App } from "./App";

ReactDOM.render(<App />, document.getElementById("container"));

export {
  BalancesTable,
  BalancesTableCell,
  BalancesTableContent,
  BalancesTableFooter,
  BalancesTableHead,
  BalancesTableRow,
  Button,
  ScrollBarImpl,
  TextField,
  useBalancesContext,
  WithMotion,
} from "./Component";
export * from "./ViewRenderer";
