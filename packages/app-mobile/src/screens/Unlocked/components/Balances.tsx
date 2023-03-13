// TODO(peter) one thing we might need to make sure is that when we wrap these FlatLists in a ScrollView, we can't nest virtualized lists.
// This means we might just use the scrollview directly from within a flatlist by using ListHeaderComponent and ListFooterComponent
import type { Token } from "@@types/types";
import type { Blockchain } from "@coral-xyz/common";
import type { useBlockchainTokensSorted } from "@coral-xyz/recoil";

import React, { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { formatUSD } from "@coral-xyz/common";
import {
  blockchainBalancesSorted,
  allWalletsDisplayed,
} from "@coral-xyz/recoil";
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
          scrollEnabled={false}
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
  return (
    <Pressable onPress={onPress}>
      <Margin left={4}>
        <Row>
          <Text>{name}</Text>
          <ExpandCollapseIcon size={15} isExpanded={false} />
        </Row>
      </Margin>
    </Pressable>
  );
}

// Used for each individual row  of Balances
function TextPercentChanged({ percentChange }: { percentChange: number }) {
  const theme = useTheme();
  const positive = !!(percentChange && percentChange > 0);
  const negative = !!(percentChange && percentChange < 0);
  const neutral = !!(percentChange && percentChange === 0);

  return (
    <>
      {percentChange !== undefined && positive ? (
        <Text
          style={[
            styles.tokenBalanceChangePositive,
            { color: theme.custom.colors.positive },
          ]}
        >
          +{formatUSD(percentChange.toLocaleString())}
        </Text>
      ) : null}
      {percentChange !== undefined && negative ? (
        <Text
          style={[
            styles.tokenBalanceChangeNegative,
            { color: theme.custom.colors.negative },
          ]}
        >
          {formatUSD(percentChange.toLocaleString())}
        </Text>
      ) : null}
      {percentChange !== undefined && neutral ? (
        <Text
          style={[
            styles.tokenBalanceChangeNeutral,
            { color: theme.custom.colors.secondary },
          ]}
        >
          {formatUSD(percentChange.toLocaleString())}
        </Text>
      ) : null}
    </>
  );
}

// Used in BalanceDetail TokenHeader, slightly diff than the other one
function RecentPercentChange({
  recentPercentChange,
}: {
  recentPercentChange: number | undefined;
}): JSX.Element {
  const theme = useTheme();
  const color =
    recentPercentChange === undefined
      ? ""
      : recentPercentChange > 0
      ? theme.custom.colors.positive
      : theme.custom.colors.negative;

  return <Text style={{ color }}>{recentPercentChange}%</Text>;
}

// Used in BalanceDetail TokenHeader, slightly diff than other recent percent changes
export function UsdBalanceAndPercentChange({
  usdBalance,
  recentPercentChange,
}: {
  usdBalance: number;
  recentPercentChange: number | undefined;
}): JSX.Element {
  const theme = useTheme();
  return (
    <View style={usdBalanceAndPercentChangeStyles.container}>
      <Text
        style={[
          usdBalanceAndPercentChangeStyles.usdBalanceLabel,
          { color: theme.custom.colors.secondary },
        ]}
      >
        ${parseFloat(usdBalance.toFixed(2)).toLocaleString()}{" "}
        <RecentPercentChange recentPercentChange={recentPercentChange} />
      </Text>
    </View>
  );
}

// Renders the individual token row
function TokenRow({
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
  const theme = useTheme();
  const { name, recentUsdBalanceChange, logo: iconUrl } = token;

  let subtitle = token.ticker;
  if (token.displayBalance) {
    subtitle = `${token.displayBalance.toLocaleString()} ${subtitle}`;
  }

  return (
    <Pressable
      onPress={() => onPressRow(blockchain, token, walletPublicKey)}
      style={styles.rowContainer}
    >
      <View style={{ flexDirection: "row" }}>
        {iconUrl ? (
          <Margin right={12}>
            <ProxyImage style={styles.rowLogo} src={iconUrl} />
          </Margin>
        ) : null}
        <View>
          <Text
            style={[styles.tokenName, { color: theme.custom.colors.fontColor }]}
          >
            {name}
          </Text>
          <Text
            style={[
              styles.tokenAmount,
              { color: theme.custom.colors.secondary },
            ]}
          >
            {subtitle}
          </Text>
        </View>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text
          style={[
            styles.tokenBalance,
            { color: theme.custom.colors.fontColor },
          ]}
        >
          {formatUSD(token.usdBalance)}
        </Text>
        <TextPercentChanged percentChange={recentUsdBalanceChange} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    overflow: "hidden",
  },
  rowLogo: {
    width: 50,
    height: 50,
    aspectRatio: 1,
    borderRadius: 25,
  },
  tokenName: {
    height: 24,
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 24,
  },
  tokenAmount: {
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 20,
  },
  tokenBalance: {
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 24,
  },
  tokenBalanceChangeNeutral: {
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 20,
  },
  tokenBalanceChangePositive: {
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 20,
  },
  tokenBalanceChangeNegative: {
    fontWeight: "500",
    fontSize: 12,
  },
});

const usdBalanceAndPercentChangeStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
  },
  usdBalanceLabel: {
    fontWeight: "500",
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
    lineHeight: 24,
  },
});
