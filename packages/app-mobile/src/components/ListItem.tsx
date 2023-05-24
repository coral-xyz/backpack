import type { PublicKey, Wallet } from "~types/types";

import { ActivityIndicator, Alert, Pressable } from "react-native";

import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";

import {
  Blockchain,
  // toTitleCase,
  // UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE,
  walletAddressDisplay,
} from "@coral-xyz/common";
import { Stack, StyledText, XStack, YStack } from "@coral-xyz/tamagui";

import { ArrowRightIcon, IconCheckmarkBold } from "~components/Icon";
import { getBlockchainLogo } from "~hooks/index";

export {
  _ListItemOneLine,
  ItemSeparator,
  ListHeader,
  ListItemActivity,
  ListItemFriendRequest,
  ListItemLabelValue,
  ListItemNotification,
  ListItemSentReceived,
  ListItemSettings,
  ListItemTableWrapper,
  ListItemToken,
  ListItemTokenSwap,
  ListItemWalletOverview,
  PaddedListItemSeparator,
  SectionHeader,
  SectionSeparator,
} from "@coral-xyz/tamagui";

const CopyPublicKey = ({ publicKey }: { publicKey: string }) => {
  return (
    <Pressable
      onPress={async () => {
        await Clipboard.setStringAsync(publicKey);
        Alert.alert("Copied to clipboard", publicKey);
      }}
    >
      <StyledText fontSize="$xs" color="$accentBlue">
        Copy
      </StyledText>
    </Pressable>
  );
};

type ListItemWalletProps = Wallet & {
  onPressEdit: (
    b: Blockchain,
    w: Pick<Wallet, "name" | "publicKey" | "type">,
  ) => void;
  onSelect: (b: Blockchain, pk: PublicKey) => void;
  selected: boolean;
  loading: boolean;
  primary: boolean;
  balance: number;
};

const renderState = (selected: boolean, loading: boolean) => {
  if (loading) {
    return <ActivityIndicator size="small" />;
  }
  if (selected) {
    return <IconCheckmarkBold size={18} color="black" />;
  }

  return null;
};

export const ListItemWallet = ({
  loading,
  name,
  balance,
  publicKey,
  blockchain,
  selected,
  primary,
  type,
  onPressEdit,
  onSelect,
}: ListItemWalletProps) => {
  const logo = getBlockchainLogo(blockchain);

  return (
    <XStack ai="center" jc="space-between" height="$container" padding={12}>
      <Pressable
        style={{ flexDirection: "row", alignItems: "center" }}
        onPress={() =>
          onSelect(blockchain, publicKey)}
      >
        <Image
          source={logo}
          style={{
            aspectRatio: 1,
            width: 24,
            height: 24,
            marginRight: 12,
          }}
        />
        <YStack>
          <XStack ai="center">
            <StyledText
              color="$baseTextHighEmphasis"
              fontSize="$lg"
              mb={2}
              mr={4}
            >
              {name}
            </StyledText>
            {renderState(selected, loading)}
          </XStack>
          <StyledText color="$baseTextMedEmphasis" fontSize="$sm">
            {walletAddressDisplay(publicKey)} {primary ? "(Primary)" : ""}
          </StyledText>
        </YStack>
      </Pressable>
      <XStack ai="center" jc="flex-end">
        <YStack mr={8} ai="flex-end">
          <StyledText fontWeight="$medium">${balance}</StyledText>
          <CopyPublicKey publicKey={publicKey} />
        </YStack>
        <Pressable
          onPress={() =>
            onPressEdit(blockchain, { name, publicKey, type })}
        >
          <ArrowRightIcon />
        </Pressable>
      </XStack>
    </XStack>
  );
};
