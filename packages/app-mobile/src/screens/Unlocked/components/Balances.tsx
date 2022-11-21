import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Margin } from "@components";
import type { Blockchain } from "@coral-xyz/common";
import { formatUSD } from "@coral-xyz/common";
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

// import // ETH_NATIVE_MINT,
// NAV_COMPONENT_TOKEN,
// SOL_NATIVE_MINT,
// toTitleCase,
// walletAddressDisplay,
// "@coral-xyz/common";
import type { Token } from "./index";
import { RowSeparator, TableHeader } from "./index";

export const balances = {
  enabledBlockchains: ["ethereum", "solana"],
  filteredBlockchains: ["ethereum", "solana"],
  "solana.tokenAccountsFiltered": [
    {
      name: "Solana",
      decimals: 9,
      nativeBalance: {
        type: "BigNumber",
        hex: "0x076e32b5f7",
      },
      displayBalance: "31.913588215",
      ticker: "SOL",
      logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png",
      address: "GqRzxLfxUmuQPh48K3cq7M6uy8bScJV9qVmXcfbmT5jD",
      mint: "11111111111111111111111111111111",
      priceMint: "11111111111111111111111111111111",
      usdBalance: 406.89824974125,
      recentPercentChange: -0.57,
      recentUsdBalanceChange: -2.317763597333453,
      priceData: {
        usd: 12.75,
        usd_market_cap: 4624757141.387485,
        usd_24h_vol: 450952009.3447383,
        usd_24h_change: -0.5696174900745707,
        last_updated_at: 1668978758,
      },
    },
    {
      name: "USD Coin",
      decimals: 6,
      nativeBalance: {
        type: "BigNumber",
        hex: "0xb0990f",
      },
      displayBalance: "11.573519",
      ticker: "USDC",
      logo: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
      address: "Eu6DQKRJoQJKBixj72oaxbnEN5YnRS5ab82uYAU9YeLk",
      mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      priceMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      usdBalance: 11.596666037999999,
      recentPercentChange: -0.03,
      recentUsdBalanceChange: -0.0035714359978840093,
      priceData: {
        usd: 1.002,
        usd_market_cap: 44534865080.03753,
        usd_24h_vol: 1846118975.5030138,
        usd_24h_change: -0.030797092769430382,
        last_updated_at: 1668978755,
      },
    },
  ],
  "ethereum.tokenAccountsFiltered": [
    {
      name: "Ethereum",
      decimals: 9,
      nativeBalance: {
        type: "BigNumber",
        hex: "0x076e32b5f7",
      },
      displayBalance: "31.913588215",
      ticker: "ETH",
      logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png",
      address: "GqRzxLfxUmuQPh48K3cq7M6uy8bScJV9qVmXcfbmT5jD",
      mint: "11111111111111111111111111111111",
      priceMint: "11111111111111111111111111111111",
      usdBalance: 1200.89824974125,
      recentPercentChange: -0.57,
      recentUsdBalanceChange: -2.317763597333453,
      priceData: {
        usd: 12.75,
        usd_market_cap: 4624757141.387485,
        usd_24h_vol: 450952009.3447383,
        usd_24h_change: -0.5696174900745707,
        last_updated_at: 1668978758,
      },
    },
    {
      name: "USD Coin",
      decimals: 6,
      nativeBalance: {
        type: "BigNumber",
        hex: "0xb0990f",
      },
      displayBalance: "11.573519",
      ticker: "USDC",
      logo: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
      address: "Eu6DQKRJoQJKBixj72oaxbnEN5YnRS5ab82uYAU9YeLk",
      mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      priceMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      usdBalance: 11.596666037999999,
      recentPercentChange: -0.03,
      recentUsdBalanceChange: -0.0035714359978840093,
      priceData: {
        usd: 1.002,
        usd_market_cap: 44534865080.03753,
        usd_24h_vol: 1846118975.5030138,
        usd_24h_change: -0.030797092769430382,
        last_updated_at: 1668978755,
      },
    },
  ],
};

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
          <Margin key={blockchain} bottom={8}>
            <BalanceTable
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

function BalanceTable({
  blockchain,
  onPressRow,
  tokenAccounts,
  searchFilter = "",
  customFilter = () => true,
}: // displayWalletHeader,
{
  blockchain: Blockchain;
  onPressRow: (blockchain: Blockchain, token: Token) => void;
  tokenAccounts?: ReturnType<typeof useBlockchainTokensSorted>;
  searchFilter?: string;
  customFilter?: (token: Token) => boolean;
  // displayWalletHeader?: boolean;
}) {
  const [expanded, setExpanded] = React.useState(true);
  const onPressExpand = () => {
    setExpanded(!expanded);
  };

  // LOG  {"blockchain": "ethereum", "blockchainLogo": 6, "title": "Ethereum"}
  // LOG  {"blockchain": "solana", "blockchainLogo": 5, "title": "Solana"}
  // const title = toTitleCase(blockchain);
  // const blockchainLogo = useBlockchainLogo(blockchain);
  const connectionUrl = useBlockchainConnectionUrl(blockchain);
  const activeWallets = useActiveWallets();
  const wallet = activeWallets.filter((w) => w.blockchain === blockchain)[0];

  const [_tokenAccounts, _, isLoading] = tokenAccounts
    ? [tokenAccounts, "hasValue"]
    : useLoader(
        blockchainBalancesSorted(blockchain),
        [],
        [wallet.publicKey, connectionUrl]
      );

  const [search, setSearch] = useState(searchFilter);

  const searchLower = search.toLowerCase();
  const tokenAccountsFiltered2 = _tokenAccounts
    .filter(
      (t: any) =>
        t.name &&
        (t.name.toLowerCase().startsWith(searchLower) ||
          t.ticker.toLowerCase().startsWith(searchLower))
    )
    .filter(customFilter);

  const tokenAccountsFiltered = balances["solana.tokenAccountsFiltered"];

  useEffect(() => {
    setSearch(searchFilter);
  }, [searchFilter]);

  return (
    <View style={{ backgroundColor: "#fff", borderRadius: 8 }}>
      <TableHeader
        blockchain={blockchain}
        onPress={onPressExpand}
        visible={expanded}
      />

      {expanded ? (
        <FlatList
          style={{ padding: 8 }}
          initialNumToRender={2}
          scrollEnabled={false}
          data={tokenAccountsFiltered}
          ItemSeparatorComponent={RowSeparator}
          renderItem={({ item: token }) => {
            return <BalanceRow onPressRow={onPressRow} token={token} />;
          }}
        />
      ) : null}
    </View>
  );
}

function TextPercentChanged({ percentChange }) {
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

export function BalanceRow({
  onPressRow,
  token,
}: {
  onPressRow: (blockchain: Blockchain, token: Token) => void;
  token: Token;
}) {
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
      onPress={() => onPressRow(name, token)}
      style={styles.rowContainer}
    >
      <View style={{ flexDirection: "row" }}>
        <Margin right={12}>
          <Image style={styles.rowLogo} source={{ uri: iconUrl }} />
        </Margin>
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
