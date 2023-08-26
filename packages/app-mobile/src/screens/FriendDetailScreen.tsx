import { Suspense } from "react";
import { Pressable } from "react-native";

import { useFragment } from "@apollo/client";
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

import { FriendFragment } from "~src/graphql/fragments";
import { FriendDetailScreenProps } from "~src/navigation/FriendsNavigator";

function Pill({
  blockchain,
  publicKey,
}: {
  blockchain: Blockchain;
  publicKey: string;
}): JSX.Element {
  return (
    <XStack alignItems="center" bg="$card" br={16} px={12} py={8}>
      <BlockchainLogo blockchain={blockchain} size={16} />
      <StyledText ml={8} color="$secondary" fontSize="$base">
        {formatWalletAddress(publicKey)}
      </StyledText>
    </XStack>
  );
}

function PrimaryWalletList({ primaryWallets }): JSX.Element {
  return (
    <XStack ai="center" jc="center" gap={16} flexWrap="wrap">
      {primaryWallets.map((wallet) => (
        <Pill
          key={wallet.id}
          blockchain={wallet.provider.providerId.toLowerCase()}
          publicKey={wallet.address}
        />
      ))}
    </XStack>
  );
}

function ContactSection({ icon, title, subtitle }) {
  return (
    <YStack ai="center">
      <XStack ai="center" mb={8} space={8}>
        {icon}
        <StyledText fontSize="$lg" color="$baseTextHighEmphasis">
          {title}
        </StyledText>
      </XStack>
      <XStack ai="center" jc="center" gap={8}>
        <StyledText fontSize="$base" color="$secondary">
          {subtitle}
        </StyledText>
      </XStack>
    </YStack>
  );
}

function CircleActionButton({
  icon,
  title,
  onPress,
  disabled,
}: {
  icon: string;
  title: string;
  onPress: () => void;
  disabled?: boolean;
}): JSX.Element {
  return (
    <Pressable disabled onPress={onPress}>
      <YStack opacity={disabled ? 0.4 : 1} jc="center" ai="center" space={12}>
        <Circle bg="$card" size={64} ai="center" jc="center">
          <MaterialIcons name={icon} size={32} />
        </Circle>
        <StyledText fontSize="$sm">{title}</StyledText>
      </YStack>
    </Pressable>
  );
}

function Container({ route }: FriendDetailScreenProps): JSX.Element {
  const { username, userId } = route.params;
  const { data } = useFragment({
    fragment: FriendFragment,
    fragmentName: "FriendFragment",
    from: {
      __typename: "Friend",
      id: userId,
    },
  });

  return (
    <Screen>
      <YStack ai="center" f={1} jc="space-between" my={24}>
        <YStack ai="center" space={16}>
          <ContactSection
            icon={<Verified size={24} color="$greenText" />}
            title="Connected"
            subtitle={`You and @${username} are mutual friends`}
          />
          <Avatar username={username} size={164} />
          <PrimaryWalletList primaryWallets={data.primaryWallets} />
        </YStack>
        <YStack space={24}>
          <XStack ai="center" jc="center" space={24}>
            <CircleActionButton
              title="Message"
              icon="message"
              onPress={console.log}
              disabled
            />
            <CircleActionButton
              title="Send"
              icon="keyboard-arrow-up"
              onPress={console.log}
              disabled
            />
          </XStack>
        </YStack>
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
