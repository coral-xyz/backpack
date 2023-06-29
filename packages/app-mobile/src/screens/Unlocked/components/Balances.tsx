// TODO(peter) one thing we might need to make sure is that when we wrap these FlatLists in a ScrollView, we can't nest virtualized lists.
// This means we might just use the scrollview directly from within a flatlist by using ListHeaderComponent and ListFooterComponent
import type { Blockchain } from "@coral-xyz/common";
import type { useBlockchainTokensSorted } from "@coral-xyz/recoil";
import type { Token, PublicKey } from "~types/types";

import React, { useEffect, useState, useCallback } from "react";
import {
  StyleProp,
  ViewStyle,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { formatUsd } from "@coral-xyz/common";
import {
  blockchainBalancesSorted,
  allWalletsDisplayed,
} from "@coral-xyz/recoil";
import {
  TextPercentChanged,
  RoundedContainerGroup,
  XStack,
  StyledText,
  Stack,
  ListItem,
  YStack,
  Circle,
} from "@coral-xyz/tamagui";
import { useNavigation } from "@react-navigation/native";
import { useRecoilValueLoadable } from "recoil";

import { ExpandCollapseIcon } from "~components/Icon";
import {
  ListRowSeparator,
  Margin,
  ProxyImage,
  Row,
  StyledTextInput,
} from "~components/index";
import { useTheme } from "~hooks/useTheme";

import { TableHeader } from "./index";

export function SearchableTokenTables({
  onPressRow,
  customFilter = () => true,
}: {
  onPressRow: (blockchain: Blockchain, token: Token) => void;
  customFilter: (token: Token) => boolean;
}) {
  const [searchFilter, setSearchFilter] = useState("");
  return (
    <>
      <Margin bottom={12}>
        <StyledTextInput
          placeholder="Search"
          value={searchFilter}
          onChangeText={setSearchFilter}
        />
      </Margin>
      <TokenTables
        searchFilter={searchFilter}
        onPressRow={onPressRow}
        customFilter={customFilter}
      />
    </>
  );
}

// Renders each blockchain section
export function TokenTables({
  onPressRow,
  searchFilter = "",
  customFilter = () => true,
  tokenAccounts,
}: {
  onPressRow: (blockchain: Blockchain, token: Token) => void;
  searchFilter?: string;
  customFilter?: (token: Token) => boolean;
  tokenAccounts?: ReturnType<typeof useBlockchainTokensSorted>;
}) {
  const wl = useRecoilValueLoadable(allWalletsDisplayed);
  const wallets = wl.state === "hasValue" ? wl.contents : [];
  return (
    <>
      {wallets.map(
        (wallet: {
          blockchain: Blockchain;
          publicKey: string;
          type: string;
          name: string;
        }) => (
          <WalletTokenTable
            key={wallet.publicKey.toString()}
            onPressRow={onPressRow}
            searchFilter={searchFilter}
            customFilter={customFilter}
            wallet={wallet}
            blockchain={wallet.blockchain}
            tokenAccounts={tokenAccounts}
          />
        )
      )}
    </>
  );
}

export function SearchableTokenList({
  blockchain,
  publicKey,
  onPressRow,
  searchFilter = "",
  customFilter = () => true,
  style,
  contentContainerStyle,
}: {
  blockchain: Blockchain;
  publicKey: PublicKey;
  onPressRow: (blockchain: Blockchain, token: Token) => void;
  tokenAccounts?: ReturnType<typeof useBlockchainTokensSorted>;
  searchFilter?: string;
  customFilter?: (token: Token) => boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}): JSX.Element {
  const rta = useRecoilValueLoadable(
    blockchainBalancesSorted({
      publicKey,
      blockchain,
    })
  );

  const rawTokenAccounts = rta.state === "hasValue" ? rta.contents : [];
  const searchLower = searchFilter.toLowerCase();
  const tokenAccountsFiltered = rawTokenAccounts
    .filter(
      (t: Token) =>
        t?.name.toLowerCase().startsWith(searchLower) ||
        t?.ticker.toLowerCase().startsWith(searchLower)
    )
    .filter(customFilter);

  const keyExtractor = (item) => item.address;
  const renderItem = useCallback(
    ({ item: token, index }: { item: Token; index: number }) => {
      const isFirst = index === 0;
      const isLast = index === tokenAccountsFiltered.length - 1;

      return (
        <RoundedContainerGroup
          disableTopRadius={!isFirst}
          disableBottomRadius={!isLast}
        >
          <TokenRow
            onPressRow={onPressRow}
            blockchain={blockchain}
            token={token}
            walletPublicKey={publicKey}
          />
        </RoundedContainerGroup>
      );
    },
    [blockchain, onPressRow, publicKey, tokenAccountsFiltered.length]
  );

  return (
    <FlatList
      style={style}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={contentContainerStyle}
      data={tokenAccountsFiltered}
      showsVerticalScrollIndicator={false}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
    />
  );
}

// Renders the header (expand/collapse) as well as the list of tokens
function WalletTokenTable({
  blockchain,
  onPressRow,
  tokenAccounts,
  searchFilter = "",
  customFilter = () => true,
  wallet,
}: {
  blockchain: Blockchain;
  onPressRow: (blockchain: Blockchain, token: Token) => void;
  tokenAccounts?: ReturnType<typeof useBlockchainTokensSorted>;
  searchFilter?: string;
  customFilter?: (token: Token) => boolean;
  wallet: { name: string; publicKey: string };
}): JSX.Element {
  const navigation = useNavigation();
  const theme = useTheme();
  const [search, setSearch] = useState(searchFilter);
  const [expanded, setExpanded] = React.useState(true);
  const onPressExpand = () => {
    setExpanded(!expanded);
  };

  const rta = useRecoilValueLoadable(
    blockchainBalancesSorted({
      publicKey: wallet.publicKey.toString(),
      blockchain,
    })
  );

  const rawTokenAccounts = rta.state === "hasValue" ? rta.contents : [];

  const searchLower = search.toLowerCase();
  const tokenAccountsFiltered = rawTokenAccounts
    .filter(
      (t: any) =>
        t.name &&
        (t.name.toLowerCase().startsWith(searchLower) ||
          t.ticker.toLowerCase().startsWith(searchLower))
    )
    .filter(customFilter);

  useEffect(() => {
    setSearch(searchFilter);
  }, [searchFilter]);

  return (
    <View
      style={{
        borderColor: theme.custom.colors.borderFull,
        backgroundColor: theme.custom.colors.nav,
        borderRadius: 12,
      }}
    >
      <TableHeader
        blockchain={blockchain}
        onPress={onPressExpand}
        visible={expanded}
        subtitle={
          <WalletPickerButton
            name={wallet.name}
            onPress={() => {
              navigation.navigate("wallet-picker");
            }}
          />
        }
      />

      {expanded ? (
        <FlatList
          scrollEnabled
          data={tokenAccountsFiltered}
          keyExtractor={(item) => item.address}
          ItemSeparatorComponent={ListRowSeparator}
          renderItem={({ item: token }) => {
            return (
              <TokenRow
                onPressRow={onPressRow}
                blockchain={blockchain}
                token={token}
                walletPublicKey={wallet.publicKey.toString()}
              />
            );
          }}
        />
      ) : null}
    </View>
  );
}

export function WalletPickerButton({
  name,
  onPress,
}: {
  name: string;
  onPress: () => void;
}): JSX.Element {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress}>
      <Margin left={6}>
        <Row>
          <Text
            style={{
              color: theme.custom.colors.icon,
            }}
          >
            {name}
          </Text>
          <ExpandCollapseIcon
            size={15}
            isExpanded={false}
            color={theme.custom.colors.icon}
          />
        </Row>
      </Margin>
    </Pressable>
  );
}

function TextUsdBalance({ usdBalance }: { usdBalance: number }): JSX.Element {
  return (
    <ListItemStyledText fontSize="$lg" color="$baseTextHighEmphasis">
      {formatUsd(usdBalance)}
    </ListItemStyledText>
  );
}

function TextAmountBalance({
  displayBalance,
  ticker,
}: {
  displayBalance?: string;
  ticker: string;
}): JSX.Element {
  const subtitle = displayBalance ? `${displayBalance} ${ticker}` : ticker;
  return (
    <ListItemStyledText color="$baseTextMedEmphasis">
      {subtitle}
    </ListItemStyledText>
  );
}

type ListItemSubProps = {
  children: React.ReactNode;
};

function ListItemLeft({ children }: ListItemSubProps) {
  return (
    <YStack f={1} space={4} mr={24}>
      {children}
    </YStack>
  );
}

function ListItemRight({ children }: ListItemSubProps) {
  return (
    <YStack f={-1} space={4} ai="flex-end">
      {children}
    </YStack>
  );
}

function ListItemRow({ children }: ListItemSubProps) {
  return (
    <XStack f={1} jc="space-between" ai="center">
      {children}
    </XStack>
  );
}

function ListItemStyledText({ children, ...props }: ListItemSubProps) {
  return (
    <StyledText
      textOverflow="ellipsis"
      color="$baseTextHighEmphasis"
      numberOfLines={1}
      {...props}
    >
      {children}
    </StyledText>
  );
}

function ListItemIcon({ iconUrl }: { iconUrl: string }) {
  return (
    <Circle size={40} overflow="hidden">
      {iconUrl ? <ProxyImage size={40} src={iconUrl} /> : null}
    </Circle>
  );
}

function ListItemWrapper({ children, grouped, ...props }): JSX.Element {
  return (
    <ListItem
      pressTheme
      hoverTheme
      overflow="hidden"
      backgroundColor="$nav"
      borderRadius={grouped ? 0 : "$container"}
      borderColor={grouped ? undefined : "$borderFull"}
      borderWidth={grouped ? 0 : 2}
      px={16}
      py={12}
      {...props}
    >
      {children}
    </ListItem>
  );
}

export function TokenRow({
  onPressRow,
  token,
  blockchain,
  walletPublicKey,
}: {
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

  return (
    <ListItemWrapper
      grouped
      onPress={() => onPressRow(blockchain, token, walletPublicKey)}
      icon={<ListItemIcon iconUrl={iconUrl} />}
    >
      <ListItemRow>
        <ListItemLeft>
          <ListItemStyledText fontSize="$lg">{name}</ListItemStyledText>
          <TextAmountBalance
            displayBalance={token.displayBalance}
            ticker={token.ticker}
          />
        </ListItemLeft>
        <ListItemRight>
          <TextUsdBalance usdBalance={token.usdBalance} />
          <TextPercentChanged percentChange={recentUsdBalanceChange} />
        </ListItemRight>
      </ListItemRow>
    </ListItemWrapper>
  );
}
