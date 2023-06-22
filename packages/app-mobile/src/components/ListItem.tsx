import type { Wallet } from "~types/types";

import { ActivityIndicator, Alert, Pressable, Image } from "react-native";

import * as Clipboard from "expo-clipboard";

import { formatWalletAddress } from "@coral-xyz/common";
import {
  ListItem,
  StyledText,
  XStack,
  YStack,
  useTheme as useTamaguiTheme,
} from "@coral-xyz/tamagui";

import {
  IconCheckmark,
  ArrowRightIcon,
  IconCheckmarkBold,
  WarningIcon,
} from "~components/Icon";
import { PriceChangePill } from "~components/Pill";
import { Avatar } from "~components/UserAvatar";
import { BlockchainLogo } from "~components/index";
import { SettingsRow } from "~screens/Unlocked/Settings/components/SettingsRow";

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
      hitSlop={{ bottom: 12, top: 12 }}
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

const WalletState = ({
  selected,
  loading,
}: {
  selected: boolean;
  loading: boolean;
}): JSX.Element | null => {
  const theme = useTamaguiTheme();
  const color = theme.baseTextHighEmphasis.val;

  if (loading) {
    return <ActivityIndicator size="small" color={color} />;
  }

  if (selected) {
    return <IconCheckmarkBold size={18} color={color} />;
  }

  return null;
};

type ListItemWalletProps = Wallet & {
  onPressEdit: (wallet: Wallet) => void;
  onSelect: (wallet: Wallet) => void;
  selected: boolean;
  loading: boolean;
  primary: boolean;
  balance: number;
  grouped?: boolean;
};

export const ListItemWallet = ({
  grouped = true,
  loading,
  name,
  publicKey,
  blockchain,
  type,
  isCold,
  balance,
  selected,
  primary,
  onPressEdit,
  onSelect,
}: ListItemWalletProps) => {
  const dehydrated = type === "dehydrated";
  const opacity = dehydrated ? 0.5 : 1;

  const handlePressRecover = () => {
    console.log("recover");
  };

  const wallet = {
    name,
    type,
    publicKey,
    blockchain,
    isCold,
  };

  return (
    <ListItem
      backgroundColor="$nav"
      onPress={() => {
        if (!dehydrated && !selected) {
          onSelect(wallet);
        }
      }}
      borderRadius={!grouped ? "$container" : undefined}
      borderColor={!grouped ? "$borderFull" : undefined}
      borderWidth={!grouped ? 2 : undefined}
      paddingHorizontal={12}
      paddingVertical={12}
      icon={
        <BlockchainLogo blockchain={blockchain} size={24} style={{ opacity }} />
      }
    >
      <XStack f={1} ai="center" jc="space-between">
        <Pressable
          style={{ flexDirection: "row", alignItems: "center" }}
          onPress={() => {
            if (!dehydrated && !selected) {
              onSelect(wallet);
            }
          }}
        >
          <YStack>
            <XStack ai="center">
              <StyledText
                color="$baseTextHighEmphasis"
                fontSize={dehydrated ? "$sm" : "$lg"}
                mb={2}
                mr={4}
                opacity={opacity}
              >
                {dehydrated ? "Not recovered" : name}
              </StyledText>
              <WalletState selected={selected} loading={loading} />
            </XStack>
            <StyledText color="$baseTextMedEmphasis" fontSize="$sm">
              {formatWalletAddress(publicKey)} {primary ? "(Primary)" : ""}
            </StyledText>
          </YStack>
        </Pressable>
        <XStack ai="center" jc="flex-end">
          <YStack mr={8} ai="flex-end">
            {dehydrated ? (
              <XStack ai="center">
                <WarningIcon size="$sm" color="$yellowIcon" />
                <StyledText ml={4} mb={2} fontSize="$sm" color="$yellowText">
                  Could not add
                </StyledText>
              </XStack>
            ) : (
              <StyledText
                mb={2}
                fontWeight="$medium"
                color="$baseTextMedEmphasis"
              >
                {balance}
              </StyledText>
            )}

            <XStack ai="center" columnGap={8}>
              {dehydrated ? (
                <Pressable
                  onPress={handlePressRecover}
                  hitSlop={{ top: 12, bottom: 12 }}
                >
                  <StyledText fontSize="$xs" color="$accentBlue">
                    Recover
                  </StyledText>
                </Pressable>
              ) : null}
              <CopyPublicKey publicKey={publicKey} />
            </XStack>
          </YStack>
          <Pressable onPress={() => onPressEdit(wallet)}>
            <ArrowRightIcon />
          </Pressable>
        </XStack>
      </XStack>
    </ListItem>
  );
};

export function ListItemTokenPrice({
  grouped,
  imageUrl,
  onPress,
  name,
  symbol,
  price,
  percentChange,
}: any) {
  return (
    <ListItem
      onPress={onPress}
      overflow="hidden"
      borderRadius={grouped ? 0 : "$container"}
      borderColor={grouped ? undefined : "$borderFull"}
      borderWidth={grouped ? 0 : 2}
      px={16}
      py={12}
      backgroundColor="$nav"
      icon={
        <Image source={{ uri: imageUrl }} style={{ width: 24, height: 24 }} />
      }
    >
      <XStack f={1} jc="space-between" ai="center">
        <YStack>
          <StyledText>{name}</StyledText>
          <StyledText>{symbol}</StyledText>
        </YStack>
        <PriceChangePill percentChange={percentChange} price={price} />
      </XStack>
    </ListItem>
  );
}

const getDetailIcon = (isLoading: boolean, isActive: boolean) => {
  if (isLoading) {
    return <ActivityIndicator size="small" />;
  }

  if (isActive) {
    return <IconCheckmark size={24} />;
  }

  return null;
};

export function UserAccountListItem({
  uuid,
  username,
  isActive,
  isLoading,
  onPress,
}: {
  uuid: string;
  username: string;
  isActive: boolean;
  isLoading: boolean;
  onPress: (uuid: string) => void;
}): JSX.Element {
  const detailIcon = getDetailIcon(isLoading, isActive);
  return (
    <SettingsRow
      icon={<Avatar username={username} size={24} />}
      label={`@${username}`}
      detailIcon={detailIcon}
      onPress={() => onPress(uuid)}
    />
  );
}
