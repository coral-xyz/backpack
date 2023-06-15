import {
  FlatList,
  Image,
  Pressable,
  SectionList,
  StyleSheet,
  View,
} from "react-native";
import type { Blockchain } from "@coral-xyz/common";
import { formatUsd } from "@coral-xyz/common";

import { useCustomTheme as useTheme } from "../hooks/index";
import { ListItem, Separator, Stack, XStack, YGroup, YStack } from "../";

import { getIcon, IconCheckmark, IconKeyboardArrowRight } from "./Icon";
import {
  BlockchainLogo,
  ProxyImage,
  RoundedContainerGroup,
  StyledText,
  TextPercentChanged,
  UserAvatar,
} from "./";

type Token = any;
type PublicKey = any;
type Wallet = any;

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
    <Stack bg="$nav" pl={60}>
      <Stack borderColor="$borderColor" borderWidth={1} />
    </Stack>
  );
}

function Sep() {
  return (
    <View style={{ paddingLeft: 60, backgroundColor: "white" }}>
      <View
        style={{ height: StyleSheet.hairlineWidth, backgroundColor: "gray" }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  rowLogo: {
    width: 32,
    height: 32,
    aspectRatio: 1,
    borderRadius: 4,
  },
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

export function ListItemSentReceived({
  grouped = false,
  onPress,
  action,
  address,
  amount,
  iconUrl,
}: {
  grouped?: boolean;
  action: "Sent" | "Received";
  address: string;
  amount: string;
  onPress?: () => void;
  iconUrl: string;
}) {
  return (
    <ListItem
      overflow="hidden"
      onPress={onPress}
      backgroundColor="$nav"
      borderRadius={grouped ? 0 : "$container"}
      borderColor={grouped ? undefined : "$borderFull"}
      borderWidth={grouped ? 0 : 2}
      paddingHorizontal={16}
      paddingVertical={12}
      icon={<Image style={styles.rowLogo} source={{ uri: iconUrl }} />}
    >
      <XStack flex={1} justifyContent="space-between">
        <YStack>
          <StyledText fontSize="$lg" color="$fontColor">
            {action}
          </StyledText>
          <StyledText fontSize="$sm" color="$secondary">
            To: {address}
          </StyledText>
        </YStack>
        <YStack jc="center">
          <StyledText
            fontSize="$sm"
            color={action === "Sent" ? "$negative" : "$positive"}
          >
            {action === "Sent" ? "-" : "+"}
            {amount}
          </StyledText>
        </YStack>
      </XStack>
    </ListItem>
  );
}

export function ListItemTokenSwap({
  grouped = false,
  onPress,
  title,
  caption,
  sent,
  received,
}: {
  grouped?: boolean;
  title: string;
  caption: string;
  sent: string;
  received: string;
  onPress?: () => void;
}) {
  return (
    <ListItem
      onPress={onPress}
      backgroundColor="$nav"
      borderRadius={!grouped ? "$container" : undefined}
      borderColor={!grouped ? "$borderFull" : undefined}
      borderWidth={!grouped ? 2 : undefined}
      paddingHorizontal={16}
      paddingVertical={12}
      icon={<View style={styles.rowLogo} />}
    >
      <XStack flex={1} justifyContent="space-between">
        <YStack>
          <StyledText
            fontSize="$lg"
            color="$fontColor"
            ellipsizeMode="tail"
            numberOfLines={1}
          >
            {title}
          </StyledText>
          <StyledText
            fontSize="$sm"
            color="$secondary"
            ellipsizeMode="tail"
            numberOfLines={1}
          >
            {caption}
          </StyledText>
        </YStack>
        <YStack flex={0} maxWidth={100} alignItems="flex-end">
          <StyledText
            fontSize="$sm"
            color="$positive"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {received}
          </StyledText>
          <StyledText
            fontSize="$sm"
            color="$negative"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {sent}
          </StyledText>
        </YStack>
      </XStack>
    </ListItem>
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
    <ListItem
      backgroundColor={unread ? "#E5EEFD" : "$nav"}
      borderRadius={!grouped ? "$container" : undefined}
      borderColor={!grouped ? "$borderFull" : undefined}
      borderWidth={!grouped ? 2 : undefined}
      paddingHorizontal={16}
      paddingVertical={16}
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
    </ListItem>
  );
}

type ListItemActivityProps = {
  grouped?: boolean;
  onPress: () => void;
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
        <View style={{ width: 32, height: 32 }}>
          <IconCheckmark color="green" size={28} />
        </View>
      );
    }

    if (showErrorIcon) {
      return (
        <View style={{ width: 44, height: 44 }}>
          <IconCheckmark color="red" size={28} />
        </View>
      );
    }

    if (iconUrl) {
      return <Image style={styles.rowLogo} source={{ uri: iconUrl }} />;
    }

    if (icon) {
      return icon;
    }

    return null;
  };

  const Icon = getIcon(icon, iconUrl);

  return (
    <ListItem
      onPress={onPress}
      backgroundColor="$nav"
      borderRadius={!grouped ? "$container" : undefined}
      borderColor={!grouped ? "$borderFull" : undefined}
      borderWidth={!grouped ? 2 : undefined}
      paddingHorizontal={16}
      paddingVertical={12}
      icon={Icon}
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
    </ListItem>
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
    <ListItem
      backgroundColor="$nav"
      onPress={() => onPressRow(blockchain, token, walletPublicKey)}
      borderRadius={!grouped ? "$container" : undefined}
      borderColor={!grouped ? "$borderFull" : undefined}
      borderWidth={!grouped ? 2 : undefined}
      paddingHorizontal={16}
      paddingVertical={12}
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
    </ListItem>
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
    <ListItem
      opacity={dehydrated ? 0.5 : undefined}
      backgroundColor="$nav"
      onPress={() => {
        if (!dehydrated) {
          onPress?.({ blockchain, publicKey });
        }
      }}
      borderRadius={!grouped ? "$container" : undefined}
      borderColor={!grouped ? "$borderFull" : undefined}
      borderWidth={!grouped ? 2 : undefined}
      paddingHorizontal={16}
      paddingVertical={12}
      // TODO fix logo spacing potentially
      icon={<BlockchainLogo blockchain={blockchain} size={18} />}
    >
      <XStack flex={1} jc="space-between">
        <StyledText fontSize="$lg" color="$fontColor">
          {dehydrated ? "Not recovered" : name}
        </StyledText>
        <StyledText fontSize="$lg" color="$fontColor">
          {balance}
        </StyledText>
      </XStack>
    </ListItem>
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
    <ListItem
      backgroundColor="$nav"
      borderRadius={!grouped ? "$container" : undefined}
      borderColor={!grouped ? "$borderFull" : undefined}
      borderWidth={!grouped ? 2 : undefined}
      paddingHorizontal={16}
      paddingVertical={8}
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
    </ListItem>
  );
}

export function _ListItemOneLine({
  icon,
  title,
  rightText,
  iconAfter,
  onPress,
}: {
  icon: JSX.Element | null;
  title: string;
  rightText?: string;
  iconAfter: JSX.Element | null;
  onPress?: () => void;
}): JSX.Element {
  const theme = useTheme();
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={{ height: 48, backgroundColor: theme.custom.colors.nav }}
    >
      <XStack py={8} px={16} f={1} bg="$nav" jc="space-between" ai="center">
        <XStack ai="center">
          {icon ? <View style={{ width: 32, height: 32 }}>{icon}</View> : null}
          <StyledText ml={16} fontSize="$base" color="$fontColor">
            {title}
          </StyledText>
        </XStack>
        <XStack ai="center">
          {rightText ? <StyledText mr={8}>{rightText}</StyledText> : null}
          {iconAfter}
        </XStack>
      </XStack>
    </Pressable>
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

export function UserList() {
  const data = Array.from({ length: 10 }).map(() => {
    return {
      title: "armani",
      iconUrl:
        "https://images.xnfts.dev/cdn-cgi/image/fit=contain,width=120,height=120,quality=85/https://swr.xnfts.dev/avatars/backpack_dev/1681404388701?size=120",
    };
  });

  return (
    <RoundedContainerGroup>
      <FlatList
        data={data}
        ItemSeparatorComponent={Separator}
        renderItem={({ item }) => {
          return (
            <_ListItemOneLine
              title={item.title}
              icon={
                <Image
                  source={{
                    uri: "https://images.xnfts.dev/cdn-cgi/image/fit=contain,width=120,height=120,quality=85/https://swr.xnfts.dev/avatars/backpack_dev/1681404388701?size=120",
                  }}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 64,
                    aspectRatio: 1,
                  }}
                />
              }
              iconAfter={<IconKeyboardArrowRight />}
            />
          );
        }}
      />
    </RoundedContainerGroup>
  );
}

export function SettingsList() {
  return (
    <YGroup
      overflow="hidden"
      borderWidth={2}
      borderColor="$borderFull"
      borderRadius="$container"
      separator={<Sep />}
    >
      <YGroup.Item>
        <ListItemSettings title="Wallets" iconName="account-balance-wallet" />
      </YGroup.Item>
      <YGroup.Item>
        <ListItemSettings title="Account" iconName="account-circle" />
      </YGroup.Item>
      <YGroup.Item>
        <ListItemSettings title="Preferences" iconName="settings" />
      </YGroup.Item>
      <YGroup.Item>
        <ListItemSettings title="xNFTs" iconName="apps" />
      </YGroup.Item>
      <YGroup.Item>
        <ListItemSettings title="Authenticated Apps" iconName="vpn-key" />
      </YGroup.Item>
      <YGroup.Item>
        <ListItemSettings title="Lock" iconName="lock" />
      </YGroup.Item>
    </YGroup>
  );
}

export function SectionedList() {
  const sections = [
    {
      title: "A",
      data: [
        {
          address: "5iM4...F5To",
          action: "Sent",
          amount: "4 USDC",
          iconUrl:
            "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
        },
        // add more sent transactions here
      ],
    },
    {
      title: "B",
      data: [
        {
          address: "5iM4...F5To",
          action: "Received",
          amount: "4 USDC",
          iconUrl:
            "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
        },
        {
          address: "5iM4...F5To",
          action: "Received",
          amount: "4 USDC",
          iconUrl:
            "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
        },
      ],
    },
  ];

  return (
    <SectionList
      sections={sections}
      stickySectionHeadersEnabled={false}
      ListHeaderComponent={<StyledText>Header</StyledText>}
      // separator cuts into the border but we can figure this out
      // ItemSeparatorComponent={Separator}
      renderSectionHeader={({ section: { title } }) => (
        <StyledText my={12}>{title}</StyledText>
      )}
      renderItem={({ item, section, index }) => {
        const isFirst = index === 0;
        const isLast = index === section.data.length - 1;

        const action = item.action as "Sent" | "Received";

        return (
          <RoundedContainerGroup
            disableTopRadius={!isFirst}
            disableBottomRadius={!isLast}
          >
            <ListItemSentReceived
              grouped
              address={item.address}
              action={action}
              amount={item.amount}
              iconUrl={item.iconUrl}
            />
          </RoundedContainerGroup>
        );
      }}
    />
  );
}
