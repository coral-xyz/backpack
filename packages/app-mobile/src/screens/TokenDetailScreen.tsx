import type { StackScreenProps } from "@react-navigation/stack";

import { View, StyleSheet } from "react-native";

import { NavTokenAction, NavTokenOptions } from "@@types/types";
import { Blockchain } from "@coral-xyz/common";

import { RecentActivityList } from "~components/RecentActivityList";
import { TransferWidget } from "~components/Unlocked/Balances/TransferWidget";
import {
  Screen,
  TokenAmountHeader,
  FullScreenLoading,
} from "~components/index";
import {
  useActiveEthereumWallet,
  useBlockchainTokenData,
  useBlockchainActiveWallet,
} from "~hooks/recoil";
import type { WalletStackParamList } from "~navigation/WalletsNavigator";
import { UsdBalanceAndPercentChange } from "~screens/Unlocked/components/Balances";

function TokenHeader({
  blockchain,
  address,
  onPressOption,
}: {
  blockchain: Blockchain;
  address: string;
  onPressOption: (route: NavTokenAction, options: NavTokenOptions) => void;
}) {
  const { data: wallet } = useBlockchainActiveWallet(blockchain);
  const { data: token, loading } = useBlockchainTokenData({
    publicKey: wallet.publicKey.toString(),
    blockchain,
    tokenAddress: address,
  });

  if (!token || loading) {
    return <FullScreenLoading />;
  }

  return (
    <View>
      <View>
        <TokenAmountHeader
          token={token}
          amount={token.nativeBalance}
          displayLogo={false}
        />
        <UsdBalanceAndPercentChange
          usdBalance={token.usdBalance}
          recentPercentChange={token.recentPercentChange}
        />
      </View>
      <View style={styles.tokenHeaderButtonContainer}>
        <TransferWidget
          token={token}
          blockchain={blockchain}
          address={address}
          onPressOption={onPressOption}
          rampEnabled={
            (blockchain === Blockchain.SOLANA && token.ticker === "SOL") ||
            (blockchain === Blockchain.ETHEREUM && token.ticker === "ETH")
          }
        />
      </View>
    </View>
  );
}

export function TokenDetailScreen({
  route,
  navigation,
}: StackScreenProps<WalletStackParamList, "TokenDetail">): JSX.Element | null {
  const { blockchain, tokenAddress } = route.params;

  // We only use ethereumWallet here, even though its shared on the Solana side too.
  const { data: ethereumWallet, loading } = useActiveEthereumWallet();
  if (!blockchain || !tokenAddress || loading) {
    return null;
  }

  const activityAddress =
    blockchain === Blockchain.ETHEREUM
      ? ethereumWallet.publicKey
      : tokenAddress;
  const contractAddresses =
    blockchain === Blockchain.ETHEREUM ? [tokenAddress] : undefined;

  return (
    <Screen>
      <View>
        <TokenHeader
          blockchain={blockchain}
          address={tokenAddress}
          onPressOption={(route: string, options: NavTokenOptions) => {
            navigation.push(route, options);
          }}
        />
      </View>
      <RecentActivityList
        blockchain={blockchain}
        address={activityAddress}
        contractAddresses={contractAddresses}
        minimize
        style={{ marginTop: 18 }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  tokenHeaderButtonContainer: {
    justifyContent: "space-between",
    marginTop: 24,
  },
});
