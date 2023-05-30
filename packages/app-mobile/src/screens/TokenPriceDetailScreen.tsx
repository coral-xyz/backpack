import { Suspense } from "react";

import { StyledText, Separator, Paragraph, XStack } from "@coral-xyz/tamagui";
import { ErrorBoundary } from "react-error-boundary";

import { Screen, ScreenError, ScreenLoading } from "~components/index";
import { TokenPriceDetailScreenParams } from "~navigation/types";

import data from "./TokenPriceListData.json";

function BalanceSummaryWidget() {
  return (
    <XStack ai="center" bg="white" borderWidth={2} borderColor="$borderFull">
      <StyledText>Balance Summary</StyledText>
    </XStack>
  );
}

function PriceHeader({ token }) {
  return (
    <XStack ai="center" bg="white" borderWidth={2} borderColor="$borderFull">
      <StyledText>{token.name}</StyledText>

      <Separator alignSelf="stretch" vertical />
      <StyledText>{token.symbol}</StyledText>

      <Separator alignSelf="stretch" vertical />
      <StyledText>{token.currentPrice}</StyledText>
    </XStack>
  );
}

function Container({ route }: TokenPriceDetailScreenParams): JSX.Element {
  const { tokenId } = route.params;
  const token = data.find((item) => item.id === tokenId);

  return (
    <Screen>
      <PriceHeader token={token} />
      <BalanceSummaryWidget />
      {token ? (
        <StyledText>{JSON.stringify(token, null, 2)}</StyledText>
      ) : (
        <StyledText>Token not found</StyledText>
      )}
    </Screen>
  );
}

export function TokenPriceDetailScreen({
  navigation,
  route,
}: TokenPriceDetailScreenParams): JSX.Element {
  return (
    <ErrorBoundary
      fallbackRender={({ error }) => <ScreenError error={error} />}
    >
      <Suspense fallback={<ScreenLoading />}>
        <Container route={route} navigation={navigation} />
      </Suspense>
    </ErrorBoundary>
  );
}
