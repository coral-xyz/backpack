import { Suspense } from "react";

import { Blockchain, formatWalletAddress } from "@coral-xyz/common";
import { StyledText, XStack } from "@coral-xyz/tamagui";
import { ErrorBoundary } from "react-error-boundary";

import { CurrentUserAvatar } from "~components/UserAvatar";
import {
  Screen,
  ScreenError,
  ScreenLoading,
  BlockchainLogo,
} from "~components/index";

function Pill({
  blockchain,
  publicKey,
}: {
  blockchain: Blockchain;
  publicKey: string;
}): JSX.Element {
  return (
    <XStack
      alignItems="center"
      backgroundColor="white"
      borderRadius={16}
      padding={8}
    >
      <BlockchainLogo blockchain={blockchain} size={16} />
      <StyledText ml={8} color="$secondary" fontSize="$base">
        {formatWalletAddress(publicKey)}
      </StyledText>
    </XStack>
  );
}

function ActiveWalletList() {
  const activeWallets = [];

  return (
    <XStack ai="center" jc="center" gap={8} flexWrap="wrap">
      {activeWallets.map((wallet) => (
        <Pill
          key={wallet.publicKey}
          blockchain={wallet.blockchain}
          publicKey={wallet.publicKey}
        />
      ))}
    </XStack>
  );
}

function Container({ route }: any): JSX.Element {
  const { userId } = route.params;

  return (
    <Screen>
      <StyledText>Todo {userId}</StyledText>
      <CurrentUserAvatar />
      <ActiveWalletList />
    </Screen>
  );
}

export function FriendDetailScreen({ navigation, route }): JSX.Element {
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
