import type { Token } from "@@types/types";

import { useCallback } from "react";
import {
  Image,
  StyleSheet,
  View,
  Button,
  Pressable,
  ScrollView,
  Text,
} from "react-native";

import { formatUSD, Blockchain } from "@coral-xyz/common";
import {
  Box,
  XStack,
  ListItem,
  YStack,
  YGroup,
  Separator,
} from "@coral-xyz/tamagui";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BlockchainLogo } from "~components/BlockchainLogo";
import { UserAvatar } from "~components/UserAvatar";
import { StyledText, Screen, ProxyImage } from "~components/index";
import { useTheme } from "~hooks/useTheme";

import { TextPercentChanged } from "./components/Balances";

const IconWallet = () => (
  <MaterialIcons name="account-balance-wallet" size={32} color="gray" />
);

const KeyboardArrowRight = () => (
  <MaterialIcons name="keyboard-arrow-right" size={32} color="gray" />
);

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
    width: 44,
    height: 44,
    aspectRatio: 1,
    borderRadius: 4,
  },
});

function ListItemSentReceived({
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
      onPress={onPress}
      borderRadius={!grouped ? "$container" : undefined}
      borderColor={!grouped ? "$borderFull" : undefined}
      borderWidth={!grouped ? 2 : undefined}
      paddingHorizontal={16}
      paddingVertical={12}
      icon={<Image style={styles.rowLogo} src={iconUrl} />}
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

function ListItemTokenSwap({
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
      borderRadius={!grouped ? "$container" : undefined}
      borderColor={!grouped ? "$borderFull" : undefined}
      borderWidth={!grouped ? 2 : undefined}
      paddingHorizontal={16}
      paddingVertical={12}
      icon={<View style={{ width: 40, height: 40 }} />}
    >
      <XStack flex={1} justifyContent="space-between">
        <YStack>
          <StyledText fontSize="$lg" color="$fontColor">
            {title}
          </StyledText>
          <StyledText fontSize="$sm" color="$secondary">
            {caption}
          </StyledText>
        </YStack>
        <YStack alignItems="flex-end">
          <StyledText fontSize="$sm" color="$positive">
            {received}
          </StyledText>
          <StyledText fontSize="$sm" color="$negative">
            {sent}
          </StyledText>
        </YStack>
      </XStack>
    </ListItem>
  );
}

function ListItemNotification({
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
      backgroundColor={unread ? "#E5EEFD" : undefined}
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
  iconUrl: string;
};

function ListItemActivity({
  grouped,
  onPress,
  topLeftText,
  topRightText,
  bottomLeftText,
  bottomRightText,
  iconUrl,
}: ListItemActivityProps) {
  return (
    <ListItem
      onPress={onPress}
      borderRadius={!grouped ? "$container" : undefined}
      borderColor={!grouped ? "$borderFull" : undefined}
      borderWidth={!grouped ? 2 : undefined}
      paddingHorizontal={16}
      paddingVertical={12}
      icon={<Image style={styles.rowLogo} src={iconUrl} />}
    >
      <XStack flex={1} justifyContent="space-between">
        <YStack>
          <StyledText fontSize="$lg" color="$fontColor">
            {topLeftText}
          </StyledText>
          <StyledText fontSize="$sm" color="$secondary">
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

function ListItemToken({
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
      onPress={() => onPressRow(blockchain, token, walletPublicKey)}
      borderRadius={!grouped ? "$container" : undefined}
      borderColor={!grouped ? "$borderFull" : undefined}
      borderWidth={!grouped ? 2 : undefined}
      paddingHorizontal={16}
      paddingVertical={12}
      icon={<ProxyImage style={styles.rowLogo} src={iconUrl} />}
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
            {formatUSD(token.usdBalance)}
          </StyledText>
          <TextPercentChanged percentChange={recentUsdBalanceChange} />
        </YStack>
      </XStack>
    </ListItem>
  );
}

function ListItemWalletOverview({
  grouped = false,
  name,
  blockchain,
  balance,
}: {
  grouped?: boolean;
  name: string;
  blockchain: Blockchain;
  balance: string;
}): JSX.Element {
  return (
    <ListItem
      borderRadius={!grouped ? "$container" : undefined}
      borderColor={!grouped ? "$borderFull" : undefined}
      borderWidth={!grouped ? 2 : undefined}
      paddingHorizontal={16}
      paddingVertical={12}
      // TODO fix logo spacing potentially
      icon={<BlockchainLogo blockchain={blockchain} size={18} />}
    >
      <XStack flex={1} justifyContent="space-between">
        <StyledText fontSize="$lg" color="$fontColor">
          {name}
        </StyledText>
        <StyledText fontSize="$lg" color="$fontColor">
          {balance}
        </StyledText>
      </XStack>
    </ListItem>
  );
}

function ListItemFriendRequest({
  grouped = false,
  iconUrl,
  text,
  username,
  time,
}: {
  grouped?: boolean;
  text: string;
  username: string;
  time: string;
  iconUrl: string;
}): JSX.Element {
  return (
    <ListItem
      borderRadius={!grouped ? "$container" : undefined}
      borderColor={!grouped ? "$borderFull" : undefined}
      borderWidth={!grouped ? 2 : undefined}
      paddingHorizontal={16}
      paddingVertical={8}
      icon={<UserAvatar uri={iconUrl} size={44} />}
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

function SettingsList() {
  return (
    <YGroup
      overflow="hidden"
      borderWidth={2}
      borderColor="$borderFull"
      borderRadius="$container"
      separator={<Sep />}
    >
      <YGroup.Item>
        <ListItem title="Wallets" hoverTheme icon={IconWallet} iconAfter={KeyboardArrowRight} />
      </YGroup.Item>
      <YGroup.Item>
        <ListItem hoverTheme icon={IconWallet} title="Wallets" />
      </YGroup.Item>
      <YGroup.Item>
        <ListItem hoverTheme icon={IconWallet} title="Wallets" />
      </YGroup.Item>
      <YGroup.Item>
        <ListItem hoverTheme icon={IconWallet} title="Wallets" />
      </YGroup.Item>
    </YGroup>
  );
}

export function DummyScreen({ navigation }): JSX.Element {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView>
      <Screen style={{ marginTop: insets.top }}>
        <Box marginBottom={12}>
          <SettingsList />
        </Box>
        <Box marginBottom={12}>
          <ListItemSentReceived
            address="5iM4...F5To"
            action="Sent"
            amount="4 USDC"
            iconUrl="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png"
          />
          <ListItemSentReceived
            address="5iM4...F5To"
            action="Received"
            amount="4 USDC"
            iconUrl="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png"
          />
        </Box>
        <Box marginBottom={12}>
          <YGroup
            overflow="hidden"
            borderWidth={2}
            borderColor="$borderFull"
            borderRadius="$container"
            separator={<Separator />}
          >
            <YGroup.Item>
              <ListItemTokenSwap
                grouped
                title="Token Swap"
                caption="USDC -> SOL"
                sent="-5.00 USDC"
                received="+0.2423 SOL"
              />
            </YGroup.Item>
            <YGroup.Item>
              <ListItemTokenSwap
                grouped
                title="Token Swap"
                caption="SOL -> USDC"
                sent="-5.0002 SOL"
                received="+100.00 USDC"
              />
            </YGroup.Item>
          </YGroup>
        </Box>
        <Box marginBottom={12}>
          <ListItemActivity
            grouped={false}
            onPress={console.log}
            topLeftText="Mad Lads #452"
            bottomLeftText="Minted"
            topRightText="-24.50 SOL"
            bottomRightText="-$2,719.08"
            iconUrl="https://swr.xnfts.dev/1min/https://madlist-images.s3.us-west-2.amazonaws.com/backpack_dev.png"
          />
        </Box>
        <Box marginBottom={12}>
          <YGroup
            overflow="hidden"
            borderWidth={2}
            borderColor="$borderFull"
            borderRadius="$container"
            separator={<Separator />}
          >
            <YGroup.Item>
              <ListItemNotification
                grouped
                unread
                title="Dropzone"
                body="Claim your weekly drop"
                time="14d"
                iconUrl="https://images.xnfts.dev/cdn-cgi/image/fit=contain,width=120,height=120,quality=85/https://swr.xnfts.dev/avatars/backpack_dev/1681311728112?size=120"
              />
            </YGroup.Item>
            <YGroup.Item>
              <ListItemNotification
                grouped
                title="PsyOptions"
                body="New vaults are available to trade: SOL, MNGO and PSY from the comfort of your own home. Extra options are available if you want to, but no pressure, this is just a demo notification."
                time="3min"
                iconUrl="https://images.xnfts.dev/cdn-cgi/image/fit=contain,width=120,height=120,quality=85/https://swr.xnfts.dev/avatars/backpack_dev/1681311728112?size=120"
              />
            </YGroup.Item>
          </YGroup>
        </Box>
        <Box marginBottom={12}>
          <ListItemActivity
            grouped={false}
            onPress={console.log}
            topLeftText="Mad Lads #452"
            bottomLeftText="Minted"
            topRightText="-24.50 SOL"
            bottomRightText="-$2,719.08"
            iconUrl="https://swr.xnfts.dev/1min/https://madlist-images.s3.us-west-2.amazonaws.com/backpack_dev.png"
          />
        </Box>
        <Box marginBottom={12}>
          <YGroup
            overflow="hidden"
            borderWidth={2}
            borderColor="$borderFull"
            borderRadius="$container"
            separator={<Separator />}
          >
            <YGroup.Item>
              <ListItemActivity
                grouped
                onPress={console.log}
                topLeftText="Nokiamon"
                bottomLeftText="Minted"
                topRightText="-5.50 SOL"
                bottomRightText="-$719.08"
                iconUrl="https://swr.xnfts.dev/1min/https://shdw-drive.genesysgo.net/CbWGfYfTJvBfBXCsQPj3Hvvxvfgm3bVkxMSBHJGgdQp1/095.gif"
              />
            </YGroup.Item>
            <YGroup.Item>
              <ListItemActivity
                grouped
                onPress={console.log}
                topLeftText="Moongame"
                bottomLeftText="Installed"
                topRightText="FREE"
                bottomRightText="$0.00"
                iconUrl="https://images.xnfts.dev/cdn-cgi/image/fit=contain,width=400,height=400,quality=85/https://cloudflare-ipfs.com/ipfs/bafybeiehsmfy53jnypnadxhyg3wbk43gui7gzl57uykcnw2ed5fcniqwaa/assets/icon.png"
              />
            </YGroup.Item>
          </YGroup>
        </Box>
        <Box marginBottom={12}>
          <ListItemToken
            onPressRow={console.log}
            token={{
              name: "Coral",
              ticker: "CORAL",
              usdBalance: 100,
              displayBalance: 100,
              recentUsdBalanceChange: 1.24,
              logo: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
            }}
            blockchain={Blockchain.SOLANA}
            walletPublicKey="xyz"
          />
        </Box>

        <Box marginBottom={12}>
          <YGroup
            overflow="hidden"
            borderWidth={2}
            borderColor="$borderFull"
            borderRadius="$container"
            separator={<Sep />}
          >
            <YGroup.Item>
              <ListItemToken
                grouped
                onPressRow={console.log}
                token={{
                  name: "SOL",
                  ticker: "SOL",
                  usdBalance: 3578.04,
                  displayBalance: 43.45983943,
                  recentUsdBalanceChange: -75.65,
                  logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png",
                }}
                blockchain={Blockchain.SOLANA}
                walletPublicKey="xyz"
              />
            </YGroup.Item>
            <YGroup.Item>
              <ListItemToken
                grouped
                onPressRow={console.log}
                token={{
                  name: "USDC",
                  ticker: "USDC",
                  usdBalance: 847.39,
                  displayBalance: 847.39,
                  recentUsdBalanceChange: -0.04,
                  logo: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
                }}
                blockchain={Blockchain.SOLANA}
                walletPublicKey="xyz"
              />
            </YGroup.Item>
          </YGroup>
        </Box>
        <Box marginBottom={12}>
          <ListItemWalletOverview
            name="Wallet 1"
            balance="$4,197.57"
            blockchain={Blockchain.ETHEREUM}
          />
        </Box>
        <Box marginBottom={12}>
          <YGroup
            overflow="hidden"
            borderWidth={2}
            borderColor="$borderFull"
            borderRadius="$container"
          >
            <YGroup.Item>
              <ListItemWalletOverview
                grouped
                name="Wallet 1"
                blockchain={Blockchain.SOLANA}
                balance="$4,197.57"
              />
            </YGroup.Item>
            <YGroup.Item>
              <ListItemWalletOverview
                grouped
                name="Wallet 1"
                blockchain={Blockchain.ETHEREUM}
                balance="$4,197.57"
              />
            </YGroup.Item>
          </YGroup>
        </Box>
        <Box marginBottom={12}>
          <YGroup
            overflow="hidden"
            borderWidth={2}
            borderColor="$borderFull"
            borderRadius="$container"
          >
            <YGroup.Item>
              <ListItemFriendRequest
                grouped
                text="Friend request accepted"
                username="@peterp"
                time="7d"
                iconUrl="https://images.xnfts.dev/cdn-cgi/image/fit=contain,width=120,height=120,quality=85/https://swr.xnfts.dev/avatars/backpack_dev/1681311728112?size=120"
              />
            </YGroup.Item>
            <YGroup.Item>
              <ListItemFriendRequest
                grouped
                text="Friend request"
                username="@peterp"
                time="14d"
                iconUrl="https://images.xnfts.dev/cdn-cgi/image/fit=contain,width=120,height=120,quality=85/https://swr.xnfts.dev/avatars/backpack_dev/1681311728112?size=120"
              />
            </YGroup.Item>
          </YGroup>
        </Box>
        <ListItemFriendRequest
          text="Friend request accepted"
          username="@peterp"
          time="7d"
          iconUrl="https://images.xnfts.dev/cdn-cgi/image/fit=contain,width=120,height=120,quality=85/https://swr.xnfts.dev/avatars/backpack_dev/1681311728112?size=120"
        />
      </Screen>
    </ScrollView>
  );
}
