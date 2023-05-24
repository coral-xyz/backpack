import { Suspense } from "react";
import { View } from "react-native";

import { Image } from "expo-image";

import { Blockchain, walletAddressDisplay } from "@coral-xyz/common";
import { useActiveWallets } from "@coral-xyz/recoil";
import { StyledText, XStack } from "@coral-xyz/tamagui";
import { ErrorBoundary } from "react-error-boundary";

import { Avatar, Screen, ScreenError, ScreenLoading } from "~components/index";
import { getBlockchainLogo } from "~hooks/index";

function AvatarHeader(): JSX.Element {
  return (
    <View style={{ alignItems: "center", marginBottom: 24 }}>
      <Avatar size={140} />
    </View>
  );
}

function NetworkIcon({
  size,
  blockchain,
}: {
  size?: number;
  blockchain: Blockchain;
}) {
  const logo = getBlockchainLogo(blockchain);
  return (
    <Image
      style={{ width: size, height: size, marginRight: 8 }}
      source={logo}
    />
  );
}

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
      <NetworkIcon blockchain={blockchain} size={16} />
      <StyledText color="$secondary" fontSize="$base">
        {walletAddressDisplay(publicKey)}
      </StyledText>
    </XStack>
  );
}

function ActiveWalletList() {
  const activeWallets = useActiveWallets();

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

function Container(): JSX.Element {
  return (
    <Screen>
      <AvatarHeader />
      <ActiveWalletList />
    </Screen>
  );
}

export function ProfileScreen(): JSX.Element {
  return (
    <ErrorBoundary
      fallbackRender={({ error }) => <ScreenError error={error} />}
    >
      <Suspense fallback={<ScreenLoading />}>
        <Container />
      </Suspense>
    </ErrorBoundary>
  );
}
