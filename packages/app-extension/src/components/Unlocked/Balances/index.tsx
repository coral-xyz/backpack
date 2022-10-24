import {
  toTitleCase,
  Blockchain,
  NAV_COMPONENT_TOKEN,
  SOL_NATIVE_MINT,
  ETH_NATIVE_MINT,
} from "@coral-xyz/common";
import { useNavigation, useBlockchainTokensSorted } from "@coral-xyz/recoil";
import { TransferWidget } from "./TransferWidget";
import { BalanceSummaryWidget } from "./BalanceSummaryWidget";
import { TokenTables } from "../../common/TokenTable";

export type Token = ReturnType<typeof useBlockchainTokensSorted>[number];

export function Balances() {
  const { push } = useNavigation();

  const onClickTokenRow = (blockchain: Blockchain, token: Token) => {
    push({
      title: `${toTitleCase(blockchain)} / ${token.ticker}`,
      componentId: NAV_COMPONENT_TOKEN,
      componentProps: {
        blockchain,
        address: token.address,
      },
    });
  };

  return (
    <div>
      <BalanceSummaryWidget />
      <div
        style={{
          marginTop: "32px",
          marginBottom: "32px",
        }}
      >
        <TransferWidget />
      </div>
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
export { useBalancesContext } from "./Balances";
export { BalancesTable } from "./Balances";
export { BalancesTableCell } from "./Balances";
