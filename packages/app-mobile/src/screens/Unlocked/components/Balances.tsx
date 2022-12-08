import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Margin, ProxyImage } from "@components";
import type { Blockchain } from "@coral-xyz/common";
import { formatUSD, walletAddressDisplay } from "@coral-xyz/common";
import type { useBlockchainTokensSorted } from "@coral-xyz/recoil";
import {
  blockchainBalancesSorted,
  useActiveWallets,
  useBlockchainConnectionUrl,
  // useBlockchainLogo,
  useEnabledBlockchains,
  useLoader,
} from "@coral-xyz/recoil";
import { useTheme } from "@hooks";
import * as Clipboard from "expo-clipboard";

import type { Token } from "./index";
import { RowSeparator, TableHeader } from "./index";

// Renders each blockchain section
export function TokenTables({
  blockchains,
  onPressRow,
  searchFilter = "",
  customFilter = () => true,
}: {
  blockchains?: Array<Blockchain>;
  onPressRow: (blockchain: Blockchain, token: Token) => void;
  searchFilter?: string;
  customFilter?: (token: Token) => boolean;
}) {
  const enabledBlockchains = useEnabledBlockchains();
  const filteredBlockchains =
    blockchains?.filter((b) => enabledBlockchains.includes(b)) ||
    enabledBlockchains;

  return (
    <View style={{ padding: 8, flex: 1 }}>
      {filteredBlockchains.map((blockchain: Blockchain) => {
        return (
          <Margin key={blockchain} bottom={12}>
            <TokenTable
              blockchain={blockchain}
              onPressRow={onPressRow}
              searchFilter={searchFilter}
              customFilter={customFilter}
            />
          </Margin>
        );
      })}
    </View>
  );
}

// Renders the header (expand/collapse) as well as the list of tokens
function TokenTable({
  blockchain,
  onPressRow,
  tokenAccounts,
  searchFilter = "",
  customFilter = () => true,
  displayWalletHeader = true,
}: {
  blockchain: Blockchain;
  onPressRow: (blockchain: Blockchain, token: Token) => void;
  tokenAccounts?: ReturnType<typeof useBlockchainTokensSorted>;
  searchFilter?: string;
  customFilter?: (token: Token) => boolean;
  displayWalletHeader?: boolean;
}): JSX.Element {
  const theme = useTheme();
  const [search, setSearch] = useState(searchFilter);
  const [expanded, setExpanded] = React.useState(true);
  const onPressExpand = () => {
    setExpanded(!expanded);
  };

  const connectionUrl = useBlockchainConnectionUrl(blockchain);
  const activeWallets = useActiveWallets();
  const wallet = activeWallets.filter((w) => w.blockchain === blockchain)[0];

  const [rawTokenAccounts, _, isLoading] = tokenAccounts
    ? [tokenAccounts, "hasValue"]
    : useLoader(
        blockchainBalancesSorted(blockchain),
        [],
        [wallet.publicKey, connectionUrl]
      );

  const searchLower = search.toLowerCase();
  const tokenAccountsFiltered = rawTokenAccounts
    .filter(
      (t: any) =>
        t.name &&
        (t.name.toLowerCase().startsWith(searchLower) ||
          t.ticker.toLowerCase().startsWith(searchLower))
    )
    .filter(customFilter);

  // LOG  {"connectionUrl": "https://eth-mainnet.g.alchemy.com/v2/DlJr6QuBC2EaE-L60-iqQQGq9hi9-XSZ", "wallet": {"blockchain": "ethereum", "name": "Wallet 1", "publicKey": "0x3b75C921A06C18b9B75dD1916F1fb97f41796CeB"}}
  console.log({ connectionUrl, wallet });

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
          displayWalletHeader ? (
            <Margin left={6}>
              <CopyWalletAddressSubtitle publicKey={wallet.publicKey} />
            </Margin>
          ) : undefined
        }
      />

      {expanded ? (
        <FlatList
          initialNumToRender={4}
          scrollEnabled={false}
          data={tokenAccountsFiltered}
          keyExtractor={(item) => item.address}
          ItemSeparatorComponent={RowSeparator}
          renderItem={({ item: token }) => {
            return (
              <TokenRow
                onPressRow={onPressRow}
                blockchain={blockchain}
                token={token}
              />
            );
          }}
        />
      ) : null}
    </View>
  );
}

function CopyWalletAddressSubtitle({
  publicKey,
}: {
  publicKey: string;
}): JSX.Element {
  const theme = useTheme();
  return (
    <Pressable
      onPress={async () => {
        await Clipboard.setStringAsync(publicKey);
      }}
    >
      <Text style={{ color: theme.custom.colors.secondary }}>
        {walletAddressDisplay(publicKey)}
      </Text>
    </Pressable>
  );
}

function TextPercentChanged({ percentChange }: { percentChange: number }) {
  const theme = useTheme();
  const positive = percentChange && percentChange > 0 ? true : false;
  const negative = percentChange && percentChange < 0 ? true : false;
  const neutral = percentChange && percentChange === 0 ? true : false;

  return (
    <>
      {percentChange !== undefined && positive && (
        <Text
          style={[
            styles.tokenBalanceChangePositive,
            { color: theme.custom.colors.positive },
          ]}
        >
          +{formatUSD(percentChange.toLocaleString())}
        </Text>
      )}
      {percentChange !== undefined && negative && (
        <Text
          style={[
            styles.tokenBalanceChangeNegative,
            { color: theme.custom.colors.negative },
          ]}
        >
          {formatUSD(percentChange.toLocaleString())}
        </Text>
      )}
      {percentChange !== undefined && neutral && (
        <Text
          style={[
            styles.tokenBalanceChangeNeutral,
            { color: theme.custom.colors.secondary },
          ]}
        >
          {formatUSD(percentChange.toLocaleString())}
        </Text>
      )}
    </>
  );
}

// Renders the individual token row
export function TokenRow({
  onPressRow,
  token,
  blockchain,
}: {
  onPressRow: (blockchain: Blockchain, token: Token) => void;
  token: Token;
  blockchain: Blockchain;
}): JSX.Element {
  const theme = useTheme();
  const { name, recentUsdBalanceChange, logo: iconUrl } = token;

  let subtitle = token.ticker;
  if (token.displayBalance) {
    subtitle = `${token.displayBalance.toLocaleString()} ${subtitle}`;
  }

  let trim;
  try {
    trim = `${subtitle.split(".")[0]}.${subtitle.split(".")[1].slice(0, 5)}`;
  } catch {
    // pass
  }

  return (
    <Pressable
      onPress={() => onPressRow(blockchain, token)}
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
            {trim ? trim : subtitle}
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
  },
  rowLogo: {
    width: 50,
    height: 50,
    aspectRatio: 1,
    borderRadius: 100,
  },
  tokenName: {
    height: 24,
    fontWeight: "500",
    fontSize: 16,
    // maxWidth: "200px",
    // overflow: "hidden",
    // color: theme.custom.colors.fontColor,
    lineHeight: 24,
  },
  tokenAmount: {
    fontWeight: "500",
    fontSize: 14,
    // color: theme.custom.colors.secondary,
    lineHeight: 20,
  },
  tokenBalance: {
    fontWeight: "500",
    fontSize: 16,
    // color: theme.custom.colors.fontColor,
    lineHeight: 24,
  },
  tokenBalanceChangeNeutral: {
    fontWeight: "500",
    fontSize: 14,
    // color: theme.custom.colors.secondary,
    // float: "right",
    lineHeight: 20,
  },
  tokenBalanceChangePositive: {
    fontWeight: "500",
    fontSize: 14,
    // color: theme.custom.colors.positive,
    // float: "right",
    lineHeight: 20,
  },
  tokenBalanceChangeNegative: {
    fontWeight: "500",
    fontSize: 12,
    // color: theme.custom.colors.negative,
    // float: "right",
  },
});
