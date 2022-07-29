import { TransferWidget } from "./TransferWidget";
import { BalanceSummaryWidget } from "./BalanceSummaryWidget";
import { TokensWidget } from "./TokensWidget";

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
        <TransferWidget />
      </div>
      <TokensWidget />
    </div>
  );
}
