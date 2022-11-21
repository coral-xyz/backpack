import { Margin, Screen } from "@components";
import { TransferWidget } from "@components/Unlocked/Balances/TransferWidget";
import type { Blockchain } from "@coral-xyz/common";
import {
  ETH_NATIVE_MINT,
  // NAV_COMPONENT_TOKEN,
  SOL_NATIVE_MINT,
  toTitleCase,
  // walletAddressDisplay,
} from "@coral-xyz/common";

import { TokenTables } from "./components/Balances";
import type { Token } from "./components/index";

function BalanceSummaryWidget() {
  return null;
}

export default function BalancesScreen({ navigation }) {
  const onPressTokenRow = (blockchain: Blockchain, token: Token) => {
    navigation.push("BlockchainTickerScreenTODO", {
      title: `${toTitleCase(blockchain)} / ${token.ticker}`,
      blockchain,
      tokenAddress: token.address,
      // componentId: NAV_COMPONENT_TOKEN,
    });
  };

  return (
    <Screen>
      <BalanceSummaryWidget />
      <Margin vertical={32}>
        <TransferWidget rampEnabled={true} />
      </Margin>
      <TokenTables
        onPressRow={onPressTokenRow}
        customFilter={(token: Token) => {
          if (token.mint && token.mint === SOL_NATIVE_MINT) {
            return true;
          }
          if (token.address && token.address === ETH_NATIVE_MINT) {
            return true;
          }
          return !token.nativeBalance.isZero();
        }}
      />
    </Screen>
  );
}
