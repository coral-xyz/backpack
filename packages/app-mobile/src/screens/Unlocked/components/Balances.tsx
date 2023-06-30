// TODO(peter) one thing we might need to make sure is that when we wrap these FlatLists in a ScrollView, we can't nest virtualized lists.
// This means we might just use the scrollview directly from within a flatlist by using ListHeaderComponent and ListFooterComponent
import type { useBlockchainTokensSorted } from "@coral-xyz/recoil";
import type { Token, PublicKey } from "~types/types";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  StyleProp,
  ViewStyle,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";

import {
  Blockchain,
  formatWalletAddress,
  UNKNOWN_ICON_SRC,
  formatUsd,
} from "@coral-xyz/common";
import {
  blockchainBalancesSorted,
  allWalletsDisplayed,
} from "@coral-xyz/recoil";
import { TextPercentChanged, RoundedContainerGroup } from "@coral-xyz/tamagui";
import { useNavigation } from "@react-navigation/native";
import { useRecoilValueLoadable } from "recoil";

import { ExpandCollapseIcon } from "~components/Icon";
import {
  ListRowSeparator,
  Margin,
  Row,
  StyledTextInput,
} from "~components/index";
import { useTheme } from "~hooks/useTheme";

import { TableHeader } from "./index";

import {
  ListItemRow,
  ListItemStyledText,
  ListItemWrapper,
  ListItemSide,
  ListItemIcon,
} from "~src/components/ListItem";

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

const UNCHANGED_VALUE = "0.00";
const NO_VALUE = "-";

export function TokenRow({
  balance,
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
  // Set the memoized change value that should be shown based on view type state
  // for the purpose of checking how the display should appear
  const changeValue = useMemo(() => {
    const val = balance.marketData?.percentChange?.toFixed(2) ?? NO_VALUE;
    return val.endsWith(UNCHANGED_VALUE) && val[0] === "-" ? val.slice(1) : val;
  }, [balance.marketData]);

  // Set the color of the balance change text based on its positive/negative nature
  const changeColor =
    changeValue === UNCHANGED_VALUE || changeValue === NO_VALUE
      ? "$secondary"
      : parseFloat(changeValue) < 0
      ? "$negative"
      : "$positive";

  // Set the change value prefix if required based on its value
  const changePrefix =
    changeColor === "$secondary" ? "" : changeColor === "$positive" ? "+" : "";

  // Set the value of the formatted balance change texted
  const changeText =
    changeValue === NO_VALUE ? changeValue : `${changePrefix}${changeValue}%`;

  // Set the name to either the found token list entry name of the truncated mint address
  const name =
    balance.tokenListEntry?.name ?? formatWalletAddress(balance.token);

  // Set the fully constructed string for the balance value text
  const valueText = balance.marketData?.value
    ? formatUsd(balance.marketData?.value)
    : "-";

  const iconUrl = balance.tokenListEntry?.logo ?? UNKNOWN_ICON_SRC;

  return (
    <ListItemWrapper
      grouped
      onPress={() => onPressRow(blockchain, token, walletPublicKey)}
      icon={<ListItemIcon source={{ uri: iconUrl }} />}
    >
      <ListItemRow>
        <ListItemSide side="left">
          <ListItemStyledText fontSize="$lg">{name}</ListItemStyledText>
          <ListItemStyledText color="$baseTextMedEmphasis">
            {balance.displayAmount} {balance.tokenListEntry?.symbol ?? ""}
          </ListItemStyledText>
        </ListItemSide>
        <ListItemSide side="right">
          <ListItemStyledText fontSize="$lg" color="$baseTextHighEmphasis">
            {valueText}
          </ListItemStyledText>
          <ListItemStyledText fontSize="$lg" color="$baseTextHighEmphasis">
            {changeText}
          </ListItemStyledText>
        </ListItemSide>
      </ListItemRow>
    </ListItemWrapper>
  );
}
