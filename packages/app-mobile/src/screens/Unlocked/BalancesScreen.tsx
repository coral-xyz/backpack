import { Screen } from "@components";
import type { Blockchain } from "@coral-xyz/common";
import {
  ETH_NATIVE_MINT,
  NAV_COMPONENT_TOKEN,
  SOL_NATIVE_MINT,
  toTitleCase,
} from "@coral-xyz/common";
import type { useBlockchainTokensSorted } from "@coral-xyz/recoil";
import { View } from "react-native";

import { TransferWidget } from "@components/Unlocked/Balances/TransferWidget";

// TODO move this
export type Token = ReturnType<typeof useBlockchainTokensSorted>[number];

function BalanceSummaryWidget() {
  return null;
}

function TokenTables({ onPressRow, customFilter }) {
  return null;
}

function BalancesScreen({ navigation }) {
  console.log("balances");
  // const background = useBackgroundClient();
  //  const wallet = useActiveSolanaWallet();

  const onPressTokenRow = (blockchain: Blockchain, token: Token) => {
    navigation.push("BlockchainTickerScreenTODO", {
      // title: `${toTitleCase(blockchain)} / ${token.ticker}`, TODO figure out push() and useNav to see where this goes
      // TODO can probably all go under props (useNavigationSegue)
      title: `${toTitleCase(blockchain)} / ${token.ticker}`,
      componentId: NAV_COMPONENT_TOKEN,
      componentProps: {
        blockchain,
        address: token.address,
      },
    });
  };

  return (
    <Screen>
      <BalanceSummaryWidget />
      <View style={{ paddingVertical: 32 }}>
        <TransferWidget rampEnabled={true} />
      </View>
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
