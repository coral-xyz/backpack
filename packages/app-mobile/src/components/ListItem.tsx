import type { Blockchain } from "@coral-xyz/common";
import type { Wallet, Token, PublicKey } from "~types/types";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";

import { formatWalletAddress, formatUsd } from "@coral-xyz/common";
import {
  ListItem,
  StyledText,
  XStack,
  YStack,
  useTheme as useTamaguiTheme,
  Separator,
  Stack,
  styled,
  YGroup,
  getIcon,
  IconKeyboardArrowRight,
  ProxyImage,
  TextPercentChanged,
  UserAvatar,
  Circle,
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

export function ListItemEditWallet({
  grouped = true,
  name,
  publicKey,
  blockchain,
  type,
  isCold,
  primary,
  onPress,
}) {
  const dehydrated = type === "dehydrated";
  const opacity = dehydrated ? 0.5 : 1;

  const wallet = {
    name,
    type,
    publicKey,
    blockchain,
    isCold,
  };

  return (
    <ListItem
      hoverTheme
      pressTheme
      backgroundColor="$nav"
      onPress={() => {
        onPress(wallet);
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
        <YStack>
          <StyledText
            color="$baseTextHighEmphasis"
            fontSize={dehydrated ? "$sm" : "$lg"}
            mb={2}
            mr={4}
            opacity={opacity}
          >
            {dehydrated ? "Not recovered" : name}
          </StyledText>
          <StyledText color="$baseTextMedEmphasis" fontSize="$sm">
            {formatWalletAddress(publicKey)} {primary ? "(Primary)" : ""}
          </StyledText>
        </YStack>
        <XStack ai="center" jc="flex-end">
          <YStack mr={8} ai="flex-end">
            {dehydrated ? (
              <XStack ai="center">
                <WarningIcon size="$sm" color="$yellowIcon" />
                <StyledText ml={4} mb={2} fontSize="$sm" color="$yellowText">
                  Could not add
                </StyledText>
              </XStack>
            ) : null}
          </YStack>
          <ArrowRightIcon />
        </XStack>
      </XStack>
    </ListItem>
  );
}

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

export const ListHeader = ({ title }: { title: string }): JSX.Element => (
  <StyledText fontSize="$base" color="$fontColor" mb={8} ml={18}>
    {title}
  </StyledText>
);

export const SectionHeader = ({ title }: { title: string }): JSX.Element => (
  <StyledText>{title}</StyledText>
);

// FlatList items like the collection list
export const ItemSeparator = () => <View style={{ height: 8 }} />;
// Sectioned list items like Recent activity
export const SectionSeparator = () => <View style={{ height: 12 }} />;

// TODO(peter) something about padding looks weird
export function PaddedListItemSeparator() {
  return (
    <Stack bg="$nav" pl={54}>
      <Stack borderColor="$borderColor" borderWidth={1} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  rowLogo: {
    width: 40,
    height: 40,
    aspectRatio: 1,
    borderRadius: 20,
  },
});

const ListItemIconContainer = styled(Stack, {
  width: 40,
  height: 40,
  overflow: "hidden",
});

// TODO: ProxyImage probably
export const ListItemIcon = styled(Image, {
  width: 40,
  height: 40,
  borderRadius: 20,
  aspectRatio: 1,
});

export function ListItemLabelValue({
  label,
  value,
  valueColor,
  onPress,
  iconAfter,
  children,
}: {
  label: string;
  value?: string;
  valueColor?: string;
  onPress?: () => void;
  iconAfter?: JSX.Element;
  children?: JSX.Element;
}) {
  if (!value && !children) {
    throw new Error("You must use either value or children");
  }

  return (
    <ListItem
      backgroundColor="$nav"
      justifyContent="space-between"
      onPress={onPress}
    >
      <StyledText>{label}</StyledText>
      {children ? (
        children
      ) : (
        <XStack alignItems="center">
          {value ? <StyledText color={valueColor}>{value}</StyledText> : null}
          {iconAfter ? (
            <View style={{ marginLeft: 2, marginRight: -8 }}>{iconAfter}</View>
          ) : null}
        </XStack>
      )}
    </ListItem>
  );
}

export function ListItemTableWrapper({ children }): JSX.Element {
  return (
    <YGroup
      overflow="hidden"
      borderWidth={2}
      borderColor="$borderFull"
      borderRadius="$container"
      backgroundColor="$nav"
      separator={<Separator />}
    >
      {children}
    </YGroup>
  );
}

export const ListItemWrapper = styled(ListItem, {
  pressTheme: true,
  hoverTheme: true,
  overflow: "hidden",
  backgroundColor: "$nav",
  px: 16,
  py: 12,
  variants: {
    grouped: {
      false: {
        borderRadius: "$container",
        borderColor: "$borderFull",
        borderWidth: 2,
      },
    },
  },
});

export const ListItemSide = styled(YStack, {
  space: 4,
  variants: {
    side: {
      left: {
        maxWidth: "60%",
        f: 1,
        mr: 24,
        jc: "center",
      },
      right: {
        maxWidth: "40%",
        f: 1,
        jc: "center",
        ai: "flex-end",
      },
    },
  } as const,
});

export const ListItemStyledText = styled(StyledText, {
  textOverflow: "ellipsis",
  color: "$baseTextHighEmphasis",
  numberOfLines: 1,
});

export const ListItemRow = styled(XStack, {
  flex: 1,
  justifyContent: "space-between",
  alignItems: "center",
});

export function ListItemSentReceived({
  grouped = false,
  onPress,
  action,
  address,
  amount,
  iconUrl,
  showSuccessIcon,
}: {
  grouped?: boolean;
  action: "Sent" | "Received";
  address: string;
  amount: string;
  onPress?: (p: any) => void;
  iconUrl: string;
  showSuccessIcon?: boolean;
}) {
  const getIcon = (showSuccessIcon: boolean | undefined, iconUrl: string) => {
    return showSuccessIcon ? (
      <ListItemIconContainer>
        <IconCheckmark color="green" size={28} />
      </ListItemIconContainer>
    ) : (
      <ListItemIcon source={{ uri: iconUrl }} />
    );
  };

  const Icon = getIcon(showSuccessIcon, iconUrl);
  return (
    <ListItemWrapper
      icon={Icon}
      grouped={grouped}
      onPress={() => {
        onPress?.({ action, address, amount });
      }}
    >
      <ListItemRow>
        <ListItemSide side="left">
          <ListItemStyledText fontSize="$lg" color="$baseTextHighEmphasis">
            {action}
          </ListItemStyledText>
          <ListItemStyledText fontSize="$sm" color="$baseTextMedEmphasis">
            To: {address}
          </ListItemStyledText>
        </ListItemSide>
        <ListItemSide side="right">
          <ListItemStyledText
            fontWeight="500"
            fontSize="$sm"
            color={action === "Sent" ? "$baseTextHighEmphasis" : "$positive"}
          >
            {action === "Sent" ? "-" : "+"}
            {amount}
          </ListItemStyledText>
        </ListItemSide>
      </ListItemRow>
    </ListItemWrapper>
  );
}

function SwapIcon({
  iconUrl,
  style,
}: {
  iconUrl: string;
  style: any; // TODO expo-image style
}): JSX.Element {
  return (
    <Image
      source={{ uri: iconUrl }}
      style={[
        style,
        {
          overflow: "hidden",
          aspectRatio: 1,
          width: 25,
          height: 25,
          borderRadius: 15,
        },
      ]}
    />
  );
}

function SwapIconSet({
  fromIcon,
  toIcon,
}: {
  fromIcon: string;
  toIcon: string;
}): JSX.Element {
  return (
    <ListItemIconContainer>
      <SwapIcon iconUrl={fromIcon} style={{ top: 5 }} />
      <SwapIcon
        iconUrl={toIcon}
        style={{ position: "absolute", top: 15, left: 10 }}
      />
    </ListItemIconContainer>
  );
}

export function ListItemTokenSwap({
  grouped = false,
  onPress,
  title,
  caption,
  sent,
  received,
  sentTokenUrl,
  receivedTokenUrl,
}: {
  grouped?: boolean;
  title: string;
  caption: string;
  sent: string;
  received: string;
  onPress?: (props: any) => void;
  sentTokenUrl: string;
  receivedTokenUrl: string;
}) {
  return (
    <ListItemWrapper
      grouped={grouped}
      icon={<SwapIconSet fromIcon={sentTokenUrl} toIcon={receivedTokenUrl} />}
      onPress={() =>
        onPress?.({
          sent,
          received,
          title,
        })
      }
    >
      <ListItemRow>
        <ListItemSide side="left">
          <ListItemStyledText fontSize="$lg" color="$fontColor">
            {title}
          </ListItemStyledText>
          <ListItemStyledText fontSize="$sm" color="$secondary">
            {caption}
          </ListItemStyledText>
        </ListItemSide>
        <ListItemSide side="right">
          <ListItemStyledText fontSize="$sm" color="$positive">
            {received}
          </ListItemStyledText>
          <ListItemStyledText fontSize="$sm" color="$negative">
            {sent}
          </ListItemStyledText>
        </ListItemSide>
      </ListItemRow>
    </ListItemWrapper>
  );
}

export function ListItemNotification({
  grouped = false,
  unread = false,
  title,
  body,
  time,
  iconUrl,
}: {
  grouped?: boolean;
  unread?: boolean;
  title: string;
  body: string;
  time: string;
  iconUrl: string;
}): JSX.Element {
  return (
    <ListItemWrapper
      grouped={grouped}
      backgroundColor={unread ? "#E5EEFD" : "$nav"}
      alignItems="flex-start"
      icon={<UserAvatar uri={iconUrl} size={44} />}
    >
      <YStack f={1}>
        <XStack
          mb={4}
          flex={1}
          justifyContent="space-between"
          alignItems="center"
        >
          <StyledText mb={2} fontSize="$base" color="$fontColor">
            {title}
          </StyledText>
          <StyledText f={0} mt={2} fontSize="$sm" color="$secondary">
            {time}
          </StyledText>
        </XStack>
        <StyledText
          maxWidth="90%"
          fontSize="$sm"
          color="$secondary"
          numberOfLines={4}
          ellipsizeMode="tail"
        >
          {body}
        </StyledText>
      </YStack>
    </ListItemWrapper>
  );
}

type ListItemActivityProps = {
  grouped?: boolean;
  onPress: (p: any) => void;
  topLeftText: string;
  topRightText: string;
  bottomLeftText: string;
  bottomRightText: string;
  iconUrl?: string;
  icon?: any;
  showSuccessIcon?: boolean;
  showErrorIcon?: boolean;
};

export function ListItemActivity({
  grouped,
  onPress,
  topLeftText,
  topRightText,
  bottomLeftText,
  bottomRightText,
  iconUrl,
  icon,
  showSuccessIcon,
  showErrorIcon,
}: ListItemActivityProps) {
  const getIcon = (icon?: any, iconUrl?: string) => {
    if (showSuccessIcon) {
      return (
        <ListItemIconContainer>
          <IconCheckmark color="green" size={28} />
        </ListItemIconContainer>
      );
    }

    if (showErrorIcon) {
      return (
        <ListItemIconContainer>
          <IconCheckmark color="red" size={28} />
        </ListItemIconContainer>
      );
    }

    if (iconUrl) {
      return <ListItemIcon source={{ uri: iconUrl }} />;
    }

    if (icon) {
      return icon;
    }

    return null;
  };

  const Icon = getIcon(icon, iconUrl);

  return (
    <ListItemWrapper
      grouped={grouped}
      icon={Icon}
      onPress={() => {
        onPress?.({
          topLeftText,
          topRightText,
          bottomLeftText,
          bottomRightText,
        });
      }}
    >
      <XStack flex={1} justifyContent="space-between">
        <YStack>
          <StyledText fontSize="$lg" color="$fontColor">
            {topLeftText}
          </StyledText>
          <StyledText
            fontSize="$sm"
            color="$secondary"
            maxWidth="80%"
            ellipsizeMode="tail"
            numberOfLines={1}
          >
            {bottomLeftText}
          </StyledText>
        </YStack>
        <YStack alignItems="flex-end">
          <StyledText fontSize="$lg" color="$fontColor">
            {topRightText}
          </StyledText>
          <StyledText fontSize="$sm" color="$secondary">
            {bottomRightText}
          </StyledText>
        </YStack>
      </XStack>
    </ListItemWrapper>
  );
}

export function ListItemToken({
  grouped = false,
  onPressRow,
  token,
  blockchain,
  walletPublicKey,
}: {
  grouped?: boolean;
  onPressRow: (
    blockchain: Blockchain,
    token: Token,
    walletPublicKey: string
  ) => void;
  token: Token;
  blockchain: Blockchain;
  walletPublicKey: string;
}): JSX.Element {
  const { name, recentUsdBalanceChange, logo: iconUrl } = token;

  let subtitle = token.ticker;
  if (token.displayBalance) {
    subtitle = `${token.displayBalance.toLocaleString()} ${subtitle}`;
  }

  return (
    <ListItemWrapper
      grouped={grouped}
      onPress={() => onPressRow(blockchain, token, walletPublicKey)}
      icon={<ProxyImage size={32} style={styles.rowLogo} src={iconUrl} />}
    >
      <XStack flex={1} justifyContent="space-between">
        <YStack>
          <StyledText fontSize="$lg" color="$fontColor">
            {name}
          </StyledText>
          <StyledText fontSize="$sm" color="$secondary">
            {subtitle}
          </StyledText>
        </YStack>
        <YStack alignItems="flex-end">
          <StyledText fontSize="$lg" color="$fontColor">
            {formatUsd(token.usdBalance)}
          </StyledText>
          <TextPercentChanged percentChange={recentUsdBalanceChange} />
        </YStack>
      </XStack>
    </ListItemWrapper>
  );
}

export function ListItemWalletOverview({
  grouped = false,
  name,
  blockchain,
  publicKey,
  balance,
  onPress,
  type,
}: {
  grouped?: boolean;
  name: string;
  type: string;
  blockchain: Blockchain;
  publicKey: PublicKey;
  balance: string;
  onPress: (wallet: Wallet) => void;
}): JSX.Element {
  const dehydrated = type === "dehydrated";
  return (
    <ListItemWrapper
      grouped={grouped}
      opacity={dehydrated ? 0.5 : undefined}
      icon={<BlockchainLogo blockchain={blockchain} size={18} />}
      onPress={() => {
        if (!dehydrated) {
          onPress?.({ blockchain, publicKey });
        }
      }}
    >
      <XStack flex={1} jc="space-between">
        <StyledText fontSize="$lg" color="$fontColor">
          {dehydrated ? "Not recovered" : name}
        </StyledText>
        <StyledText fontSize="$lg" color="$fontColor">
          {balance}
        </StyledText>
      </XStack>
    </ListItemWrapper>
  );
}

export function ListItemFriendRequest({
  grouped = false,
  text,
  username,
  time,
  avatarUrl,
}: {
  grouped?: boolean;
  text: string;
  username: string;
  time: string;
  avatarUrl: string;
}): JSX.Element {
  return (
    <ListItemWrapper
      grouped={grouped}
      icon={<UserAvatar uri={avatarUrl} size={44} />}
    >
      <XStack flex={1} justifyContent="space-between" alignItems="flex-start">
        <YStack>
          <StyledText mb={2} fontSize="$base" color="$fontColor">
            {text}
          </StyledText>
          <StyledText fontSize="$xs">{username}</StyledText>
        </YStack>
        <StyledText mt={2} fontSize="$xs" color="$secondary">
          {time}
        </StyledText>
      </XStack>
    </ListItemWrapper>
  );
}

export function _ListItemOneLine({
  loading,
  disabled,
  icon,
  title,
  rightText,
  iconAfter,
  onPress,
}: {
  disabled?: boolean;
  loading?: boolean;
  icon: JSX.Element | null;
  title: string;
  rightText?: string;
  iconAfter: JSX.Element | null;
  onPress?: () => void;
}): JSX.Element {
  return (
    <ListItem
      pressTheme
      disabled={disabled || !onPress}
      onPress={onPress}
      height={48}
      bg="$nav"
      py={8}
      px={16}
    >
      <ListItemRow>
        <XStack ai="center">
          {icon ? (
            <Stack ai="center" jc="center" mr={8} width={32} height={32}>
              {icon}
            </Stack>
          ) : null}
          <StyledText fontSize="$base" color="$fontColor">
            {title}
          </StyledText>
        </XStack>
        <XStack ai="center">
          {rightText ? <StyledText mr={8}>{rightText}</StyledText> : null}
          {loading ? <ActivityIndicator size="small" /> : iconAfter}
        </XStack>
      </ListItemRow>
    </ListItem>
  );
}

export function ListItemSettings({
  title,
  iconName,
  onPress,
  iconAfter = <IconKeyboardArrowRight />,
}: {
  title: string;
  onPress?: () => void;
  iconName: string;
  iconAfter?: JSX.Element | null;
}): JSX.Element {
  const Icon = getIcon(iconName);
  return (
    <_ListItemOneLine
      onPress={onPress}
      title={title}
      icon={Icon}
      iconAfter={iconAfter}
    />
  );
}
