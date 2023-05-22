import type { Blockchain } from "@coral-xyz/common";
import type { Token, NavTokenOptions } from "~types/types";

import { Suspense, useCallback } from "react";
import { FlatList } from "react-native";

import { blockchainBalancesSorted } from "@coral-xyz/recoil";
import { Box } from "@coral-xyz/tamagui";
import { ErrorBoundary } from "react-error-boundary";
import { useRecoilValue } from "recoil";

import { TransferWidget } from "~components/Unlocked/Balances/TransferWidget";
import {
  Screen,
  RoundedContainerGroup,
  ScreenLoading,
  ScreenError,
} from "~components/index";
import { BalanceSummaryWidget } from "~screens/Unlocked/components/BalanceSummaryWidget";
import { TokenRow } from "~screens/Unlocked/components/Balances";

function Container({ navigation, route }): JSX.Element {
  const { blockchain, publicKey } = route.params;
  const balances = useRecoilValue(
    blockchainBalancesSorted({
      publicKey,
      blockchain,
    })
  );

  const onPressToken = useCallback(
    (blockchain: Blockchain, token: Token) => {
      navigation.push("TokenDetail", {
        blockchain,
        tokenAddress: token.address,
        tokenTicker: token.ticker,
      });
    },
    [navigation]
  );

  const renderItem = useCallback(
    ({ item: token, index }: { item: Token; index: number }) => {
      const isFirst = index === 0;
      const isLast = index === balances.length - 1;

      return (
        <RoundedContainerGroup
          disableTopRadius={!isFirst}
          disableBottomRadius={!isLast}
        >
          <TokenRow
            onPressRow={onPressToken}
            blockchain={blockchain}
            token={token}
            walletPublicKey={publicKey}
          />
        </RoundedContainerGroup>
      );
    },
    [balances.length, onPressToken, blockchain, publicKey]
  );

  return (
    <Screen style={{ paddingHorizontal: 0 }}>
      <FlatList
        contentContainerStyle={{
          paddingHorizontal: 16,
        }}
        data={balances}
        keyExtractor={(item) => item.address}
        renderItem={renderItem}
        ListHeaderComponent={
          <>
            <BalanceSummaryWidget />
            <Box marginVertical={12}>
              <TransferWidget
                swapEnabled={false}
                rampEnabled={false}
                onPressOption={(route: string, options: NavTokenOptions) => {
                  navigation.push(route, options);
                }}
              />
            </Box>
          </>
        }
      />
    </Screen>
  );
}

export function TokenListScreen({ navigation, route }: any): JSX.Element {
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
