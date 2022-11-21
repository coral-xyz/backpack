import React, { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Margin, Screen } from "@components";
import { TransferWidget } from "@components/Unlocked/Balances/TransferWidget";
import type { Blockchain } from "@coral-xyz/common";
import {
  ETH_NATIVE_MINT,
  NAV_COMPONENT_TOKEN,
  SOL_NATIVE_MINT,
  toTitleCase,
  walletAddressDisplay,
} from "@coral-xyz/common";
import type { useBlockchainTokensSorted } from "@coral-xyz/recoil";
import {
  blockchainBalancesSorted,
  useActiveWallets,
  useBlockchainConnectionUrl,
  useBlockchainLogo,
  useEnabledBlockchains,
  useLoader,
} from "@coral-xyz/recoil";
import { MaterialIcons } from "@expo/vector-icons";

// TODO move this
export type Token = ReturnType<typeof useBlockchainTokensSorted>[number];

function BalanceSummaryWidget() {
  return null;
}

function TableHeader({ onPress, visible, name }) {
  return (
    <Pressable onPress={onPress} style={styles.header}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={styles.logoContainer}></View>
        <Text>{name}</Text>
      </View>
      <MaterialIcons
        name={visible ? "keyboard-arrow-up" : "keyboard-arrow-down"}
        size={24}
        color="black"
      />
    </Pressable>
  );
}

function BalanceRow({
  iconUrl,
  name,
  subtitle,
  usdBalance,
  recentUsdBalanceChange,
  onPress,
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <View style={{ flexDirection: "row" }}>
        <Image
          style={{
            width: 50,
            height: 50,
            borderRadius: 100,
            backgroundColor: "#000",
            marginRight: 12,
          }}
          source={{ uri: iconUrl }}
        />
        <View>
          <Text>{name}</Text>
          <Text>{subtitle}</Text>
        </View>
      </View>
      <Text>{recentUsdBalanceChange}</Text>
    </View>
  );
}

function RowSeparator() {
  return <View style={{ height: 12 }} />;
}

function BalanceTable({
  blockchain,
  initialState,
  onPressRow,
  tokenAccounts,
  searchFilter = "",
  customFilter = () => true,
  displayWalletHeader,
}: {
  blockchain: Blockchain;
  onPressRow: (blockchain: Blockchain, token: Token) => void;
  tokenAccounts?: ReturnType<typeof useBlockchainTokensSorted>;
  searchFilter?: string;
  customFilter?: (token: Token) => boolean;
  displayWalletHeader?: boolean;
}) {
  const [visible, setVisible] = React.useState(initialState);
  const onPress = () => {
    setVisible(!visible);
  };

  const title = blockchain;
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
  const tokenAccountsFiltered = _tokenAccounts
    .filter(
      (t: any) =>
        t.name &&
        (t.name.toLowerCase().startsWith(searchLower) ||
          t.ticker.toLowerCase().startsWith(searchLower))
    )
    .filter(customFilter);

  return (
    <View style={{ backgroundColor: "#fff", borderRadius: 8 }}>
      <TableHeader name={blockchain} onPress={onPress} visible={visible} />

      {visible ? (
        <FlatList
          style={{ padding: 8 }}
          initialNumToRender={2}
          scrollEnabled={false}
          data={tokenAccountsFiltered}
          ItemSeparatorComponent={RowSeparator}
          renderItem={({ item }) => {
            let subtitle = item.ticker;
            if (item.displayBalance) {
              subtitle = `${item.displayBalance.toLocaleString()} ${subtitle}`;
            }

            return (
              <BalanceRow
                blockchain={item.name}
                iconUrl={item.logo}
                usdBalance={item.usdBalance}
                recentUsdBalanceChange={item.recentUsdBalanceChange}
                subtitle={subtitle}
                onPressRow={onPressRow}
              />
            );
          }}
        />
      ) : null}
    </View>
  );
}

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

  console.log("TokenTables", { enabledBlockchains, filteredBlockchains });

  return (
    <View style={{ padding: 8, flex: 1 }}>
      {filteredBlockchains.map((blockchain: Blockchain) => {
        return (
          <Margin key={blockchain} bottom={8}>
            <BalanceTable
              blockchain={blockchain}
              initialState={true}
              onSelectItem={onPressRow}
              searchFilter={searchFilter}
              customFilter={customFilter}
            />
          </Margin>
        );
      })}
    </View>
  );
}

export default function BalancesScreen({ navigation }) {
  console.log("balances");
  // const background = useBackgroundClient();
  //  const wallet = useActiveSolanaWallet();

  const onPressTokenRow = (blockchain: Blockchain, token: Token) => {
    navigation.push("BlockchainTickerScreenTODO", {
      // title: `${toTitleCase(blockchain)} / ${token.ticker}`, TODO figure out push() and useNav to see where this goes
      // TODO can probably all go under props (useNavigationSegue)
      title: `${toTitleCase(blockchain)} / ${token.ticker}`,
      componentId: NAV_COMPONENT_TOKEN,
      componentProps: {
        blockchain,
        address: token.address,
      },
    });
  };

  return (
    <Screen>
      <BalanceSummaryWidget />
      <View style={{ paddingVertical: 32 }}>
        <TransferWidget rampEnabled={true} />
      </View>
      <TokenTables
        onPressRow={onPressTokenRow}
        customFilter={(token: Token) => {
          if (token.mint && token.mint === SOL_NATIVE_MINT) {
            return true;
          }
          if (token.address && token.address === ETH_NATIVE_MINT) {
            return true;
          }
          return !token.nativeBalance.isZero();
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#eee",
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 30,
    padding: 8,
  },
  logoContainer: {
    width: 12,
    height: 12,
    backgroundColor: "#000",
    marginRight: 8,
  },
});
