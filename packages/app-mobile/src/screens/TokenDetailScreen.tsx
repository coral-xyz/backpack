import { Suspense } from "react";

import { Blockchain } from "@coral-xyz/common";
import { UsdBalanceAndPercentChange, YStack } from "@coral-xyz/tamagui";
import { ErrorBoundary } from "react-error-boundary";

import { TransferWidget } from "~components/Unlocked/Balances/TransferWidget";
import {
  TokenAmountHeader,
  ScreenLoading,
  ScreenError,
} from "~components/index";
import {
  useBlockchainTokenData,
  useBlockchainActiveWallet,
} from "~hooks/recoil";
import type { TokenDetailScreenProps } from "~navigation/WalletsNavigator";

import { TransactionSectionList } from "./RecentActivityScreen";

import { useSession } from "~src/lib/SessionProvider";
import { NavTokenOptions } from "~types/types";

function TokenHeader({
  blockchain,
  address,
  onPressOption,
}: {
  blockchain: Blockchain;
  address: string;
  onPressOption: (route: string, options: NavTokenOptions) => void;
}) {
  const { data: wallet } = useBlockchainActiveWallet(blockchain);
  const { data: token, loading } = useBlockchainTokenData({
    publicKey: wallet.publicKey.toString(),
    blockchain,
    tokenAddress: address,
  });

  if (loading) {
    return null;
  }

  return (
    <YStack space={24} mb={24}>
      <YStack>
        <TokenAmountHeader
          token={token}
          amount={token.nativeBalance}
          displayLogo={false}
        />
        <UsdBalanceAndPercentChange
          usdBalance={token.usdBalance}
          recentPercentChange={token.recentPercentChange}
        />
      </YStack>
      <TransferWidget
        swapEnabled
        token={token}
        blockchain={blockchain}
        address={address}
        onPressOption={onPressOption}
        rampEnabled={
          (blockchain === Blockchain.SOLANA && token.ticker === "SOL") ||
          (blockchain === Blockchain.ETHEREUM && token.ticker === "ETH")
        }
      />
    </YStack>
  );
}

function Container({
  route,
  navigation,
}: TokenDetailScreenProps): JSX.Element | null {
  const { activeWallet } = useSession();
  const { tokenMint, address, providerId } = route.params;

  const ListHeader = (
    <TokenHeader
      blockchain={activeWallet?.blockchain}
      address={address}
      onPressOption={(route: string, options: NavTokenOptions) => {
        navigation.push(route, options);
      }}
    />
  );

  return (
    <TransactionSectionList
      ListHeaderComponent={ListHeader}
      providerId={providerId}
      address={address}
      tokenMint={tokenMint}
    />
  );
}

export function TokenDetailScreen({
  route,
  navigation,
}: TokenDetailScreenProps) {
  return (
    <ErrorBoundary
      fallbackRender={({ error }) => <ScreenError error={error} />}
    >
      <Suspense fallback={<ScreenLoading />}>
        <Container navigation={navigation} route={route} />
      </Suspense>
    </ErrorBoundary>
  );
}
