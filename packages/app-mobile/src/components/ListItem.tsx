import type { PublicKey, Wallet } from "~types/types";

import { ActivityIndicator, Alert, Pressable, Image } from "react-native";

import * as Clipboard from "expo-clipboard";

import { Blockchain, walletAddressDisplay } from "@coral-xyz/common";
import {
  ListItem,
  StyledText,
  XStack,
  YStack,
  Stack,
  useTheme as useTamaguiTheme,
} from "@coral-xyz/tamagui";

import {
  ArrowRightIcon,
  IconCheckmarkBold,
  WarningIcon,
} from "~components/Icon";
import { BlockchainLogo } from "~components/index";

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

type ListItemWalletProps = Wallet & {
  onPressEdit: (
    b: Blockchain,
    w: Pick<Wallet, "name" | "publicKey" | "type">
  ) => void;
  onSelect: (b: Blockchain, pk: PublicKey) => void;
  selected: boolean;
  loading: boolean;
  primary: boolean;
  balance: number;
  grouped?: boolean;
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

export const ListItemWallet = ({
  grouped = true,
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
  const dehydrated = type === "dehydrated";
  const opacity = dehydrated ? 0.5 : 1;

  const handlePressRecover = () => {
    console.log("recover");
  };

  return (
    <ListItem
      backgroundColor="$nav"
      onPress={() => {
        if (!dehydrated && !selected) {
          onSelect(blockchain, publicKey);
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
              onSelect(blockchain, publicKey);
            }
          }}
        >
          <YStack>
            <XStack ai="center">
              <StyledText
                color="$baseTextHighEmphasis"
                fontSize="$lg"
                mb={2}
                mr={4}
                opacity={opacity}
              >
                {dehydrated ? "Not recovered" : name}
              </StyledText>
              <WalletState selected={selected} loading={loading} />
            </XStack>
            <StyledText color="$baseTextMedEmphasis" fontSize="$sm">
              {walletAddressDisplay(publicKey)} {primary ? "(Primary)" : ""}
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
                ${balance}
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
          <Pressable
            onPress={() => onPressEdit(blockchain, { name, publicKey, type })}
          >
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
  const bgColor =
    percentChange > 0 ? "$greenBackgroundSolid" : "$redBackgroundSolid";
  const textColor = percentChange > 0 ? "$greenText" : "$redText";
  return (
    <ListItem
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
      onPress={onPress}
    >
      <XStack f={1} jc="space-between" ai="center">
        <YStack>
          <StyledText>{name}</StyledText>
          <StyledText>{symbol}</StyledText>
        </YStack>
        <Stack borderRadius={8} bg={bgColor} p={8}>
          <StyledText size="$lg" color={textColor}>
            {price}
          </StyledText>
        </Stack>
      </XStack>
    </ListItem>
  );
}
