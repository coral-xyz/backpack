import { TransferWidget } from "./TransferWidget";
import { BalanceSummaryWidget } from "./BalanceSummaryWidget";
import { TokensWidget } from "./TokensWidget";

export function Balances() {
  return (
    <div>
      <BalanceSummaryWidget />
      <TransferWidget />
      <TokensWidget />
    </div>
  );
}
