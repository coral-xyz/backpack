import {
  Blockchain,
  NAV_COMPONENT_TOKEN,
  toTitleCase,
} from "@coral-xyz/common";
import {
  BalancesTable,
  BalanceSummaryWidget,
} from "@coral-xyz/data-components";
import { useActiveWallet , useAllWalletsDisplayed, useNavigation } from "@coral-xyz/recoil";

import { SkeletonRows } from "../../common/TokenTable";

import { TransferWidget } from "./TransferWidget";

export function Balances() {
  const wallet = useActiveWallet();
  const { push } = useNavigation();

  const swapEnabled =
    useAllWalletsDisplayed().find((w) => w.blockchain === Blockchain.SOLANA) !==
    undefined;

  const onClickTokenRow = ({
    tokenAccount,
    symbol,
  }: {
    tokenAccount: string;
    symbol: string;
  }) => {
    push({
      title: `${toTitleCase(wallet.blockchain)} / ${symbol}`,
      componentId: NAV_COMPONENT_TOKEN,
      componentProps: {
        blockchain: wallet.blockchain,
        tokenAddress: tokenAccount,
        publicKey: wallet.publicKey,
      },
    });
  };

  return (
    <div>
      <BalanceSummaryWidget style={{ marginTop: 24 }} />
      <div
        style={{
          marginTop: "32px",
          marginBottom: "32px",
        }}
      >
        <TransferWidget rampEnabled swapEnabled={swapEnabled} />
      </div>
      <BalancesTable
        loaderComponent={<SkeletonRows />}
        onItemClick={onClickTokenRow}
      />
    </div>
  );
}
export { BalancesTableRow } from "./Balances";
export { BalancesTableContent } from "./Balances";
export { BalancesTableHead } from "./Balances";
export { BalancesTable } from "./Balances";
export { BalancesTableCell } from "./Balances";
