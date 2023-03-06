import {
  Blockchain,
  ETH_NATIVE_MINT,
  NAV_COMPONENT_TOKEN,
  SOL_NATIVE_MINT,
  toTitleCase,
} from "@coral-xyz/common";
import type { useBlockchainTokensSorted } from "@coral-xyz/recoil";
import { useAllWalletsDisplayed, useNavigation } from "@coral-xyz/recoil";

import { TokenTables } from "../../common/TokenTable";

import { BalanceSummaryWidget } from "./BalanceSummaryWidget";
import { TransferWidget } from "./TransferWidget";

export type Token = ReturnType<typeof useBlockchainTokensSorted>[number];

export function Balances() {
  const { push } = useNavigation();
  const swapEnabled =
    useAllWalletsDisplayed().find((w) => w.blockchain === Blockchain.SOLANA) !==
    undefined;

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

  return (
    <div>
      <BalanceSummaryWidget />
      <div
        style={{
          marginTop: "32px",
          marginBottom: "32px",
        }}
      >
        <TransferWidget rampEnabled swapEnabled={swapEnabled} />
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
