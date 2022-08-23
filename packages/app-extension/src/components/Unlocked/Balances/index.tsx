import {
  toTitleCase,
  Blockchain,
  NAV_COMPONENT_TOKEN,
} from "@coral-xyz/common";
import { ethers, BigNumber } from "ethers";
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
          marginTop: "20px",
          marginBottom: "20px",
        }}
      >
        <TransferWidget />
      </div>
      <TokenTables
        onClickRow={onClickTokenRow}
        customFilter={(token) => !token.nativeBalance.isZero()}
      />
    </div>
  );
}
