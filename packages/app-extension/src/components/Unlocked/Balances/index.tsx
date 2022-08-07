import { BalanceSummaryWidget } from "./BalanceSummaryWidget";
import { TokensWidget } from "./TokensWidget";
import { TransferWidget } from "./TransferWidget";

export function Balances() {
  return (
    <div>
      <BalanceSummaryWidget />
      <div
        style={{
          marginTop: "20px",
          marginBottom: "20px",
        }}
      >
        <TransferWidget idPrefix="balances" />
      </div>
      <TokensWidget />
    </div>
  );
}
