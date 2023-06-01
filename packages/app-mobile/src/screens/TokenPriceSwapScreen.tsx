import { Suspense } from "react";
import { ScrollView } from "react-native";

import { StyledText } from "@coral-xyz/tamagui";
import { ErrorBoundary } from "react-error-boundary";

import { Screen, ScreenError, ScreenLoading } from "~components/index";
import { TokenPriceSwapScreenParams } from "~navigation/types";

function Container({ route }: TokenPriceSwapScreenParams): JSX.Element {
  const { tokenId } = route.params;

  return (
    <ScrollView>
      <Screen style={{ paddingTop: 0, paddingHorizontal: 0 }}>
        <StyledText>Swap</StyledText>
        <StyledText>{JSON.stringify(tokenId)}</StyledText>
      </Screen>
    </ScrollView>
  );
}

export function TokenPriceSwapScreen({
  navigation,
  route,
}: TokenPriceSwapScreenParams): JSX.Element {
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
