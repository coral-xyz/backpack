import { Suspense } from "react";

import { Blockchain, formatWalletAddress } from "@coral-xyz/common";
import { Circle, StyledText, XStack, YStack } from "@coral-xyz/tamagui";
import { MaterialIcons } from "@expo/vector-icons";
import { Verified } from "@tamagui/lucide-icons";
import { ErrorBoundary } from "react-error-boundary";

import { Avatar } from "~components/UserAvatar";
import {
  Screen,
  ScreenError,
  ScreenLoading,
  BlockchainLogo,
} from "~components/index";

import { IconButton } from "~src/components/Icon";
import { FriendDetailScreenProps } from "~src/navigation/FriendsNavigator";

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

function ContactSection({ icon, title, subtitle }) {
  return (
    <YStack ai="center">
      <Circle bg="white" size={64} ai="center" jc="center" mb={8}>
        {icon}
      </Circle>
      <StyledText fontSize="$xl" color="$secondary" mb={24}>
        {title}
      </StyledText>
      <XStack ai="center" jc="center" gap={8}>
        <StyledText fontSize="$base" color="$secondary">
          {subtitle}
        </StyledText>
      </XStack>
    </YStack>
  );
}
function Container({ route }: FriendDetailScreenProps): JSX.Element {
  const { username } = route.params;

  return (
    <Screen>
      <YStack ai="center" f={1} jc="space-around">
        <ContactSection
          icon={<Verified size={32} color="$baseTextHighEmphasis" />}
          title="Connected"
          subtitle={`You and @${username} are mutual friends`}
        />
        <Avatar username={username} size={164} />
        <ActiveWalletList />
        <XStack ai="center" jc="center" space={12}>
          <YStack jc="center" ai="center" space={8}>
            <Circle bg="white" size={64} ai="center" jc="center">
              <MaterialIcons name="message" size={32} />
            </Circle>
            <StyledText fontSize="$sm">Message</StyledText>
          </YStack>
          <YStack jc="center" ai="center" space={8}>
            <Circle bg="white" size={64} ai="center" jc="center">
              <MaterialIcons name="keyboard-arrow-up" size={32} />
            </Circle>
            <StyledText fontSize="$sm">Send</StyledText>
          </YStack>
        </XStack>
      </YStack>
    </Screen>
  );
}

export function FriendDetailScreen({
  navigation,
  route,
}: FriendDetailScreenProps): JSX.Element {
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
