import {
  Blockchain,
  NAV_COMPONENT_TOKEN,
  toTitleCase,
} from "@coral-xyz/common";
import {
  BalancesTable,
  BalanceSummaryWidget,
} from "@coral-xyz/data-components";
import type { useBlockchainTokensSorted } from "@coral-xyz/recoil";
import { useAllWalletsDisplayed, useNavigation } from "@coral-xyz/recoil";

import { SkeletonRows } from "../../common/TokenTable";

import { TransferWidget } from "./TransferWidget";

type Token = ReturnType<typeof useBlockchainTokensSorted>[number];

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
      <BalanceSummaryWidget style={{ marginTop: 24 }} />
      <div
        style={{
          marginTop: "32px",
          marginBottom: "32px",
        }}
      >
        <TransferWidget rampEnabled swapEnabled={swapEnabled} />
      </div>
      <BalancesTable loaderComponent={<SkeletonRows />} />
    </div>
  );
}
export { BalancesTableRow } from "./Balances";
export { BalancesTableContent } from "./Balances";
export { BalancesTableHead } from "./Balances";
// export { useBalancesContext } from "./Balances";
export { BalancesTable } from "./Balances";
export { BalancesTableCell } from "./Balances";
