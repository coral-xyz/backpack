import {
  Blockchain,
  ETH_NATIVE_MINT,
  NAV_COMPONENT_TOKEN,
  SOL_NATIVE_MINT,
  toTitleCase,
} from "@coral-xyz/common";
import { BalanceSummaryWidget } from "@coral-xyz/data-components";
import {
  useActiveWallet,
  useFeatureGates,
  useNavigation,
} from "@coral-xyz/recoil";

import { type Token, TokenTables } from "../../common/TokenTable";

import { BalanceSummaryWidget as LegacyBalanceSummaryWidget } from "./BalanceSummaryWidget";
import { TransferWidget } from "./TransferWidget";

export function Balances() {
  const gates = useFeatureGates();
  const { push } = useNavigation();

  const swapEnabled = useActiveWallet().blockchain === Blockchain.SOLANA;

  const onClickTokenRow = (
    blockchain: Blockchain,
    token: Token,
    publicKey: string
  ) => {
    push({
      title: `${toTitleCase(blockchain)} / ${token.ticker}`,
      componentId: NAV_COMPONENT_TOKEN,
      componentProps: {
        blockchain,
        tokenAddress: token.address,
        publicKey,
      },
    });
  };

  const _SummaryComponent = gates.GQL_BALANCES
    ? BalanceSummaryWidget
    : LegacyBalanceSummaryWidget;

  return (
    <div>
      <_SummaryComponent />
      <div
        style={{
          marginTop: "20px",
          marginBottom: "20px",
        }}
      >
        <TransferWidget rampEnabled swapEnabled={swapEnabled} />
      </div>
      {/* TODO: put token table for GQL behind feature gate */}
      <TokenTables
        onClickRow={onClickTokenRow}
        customFilter={(token) => {
          if (token.mint && token.mint === SOL_NATIVE_MINT) {
            return true;
          }
          if (token.address && token.address === ETH_NATIVE_MINT) {
            return true;
          }
          return !token.nativeBalance.isZero();
        }}
      />
    </div>
  );
}
export { BalancesTableRow } from "./Balances";
export { BalancesTableContent } from "./Balances";
export { BalancesTableHead } from "./Balances";
export { BalancesTable } from "./Balances";
export { BalancesTableCell } from "./Balances";
