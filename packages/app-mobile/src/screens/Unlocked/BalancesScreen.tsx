import { Margin, Screen, TokenAmountHeader } from "@components";
import { ErrorBoundary } from "@components/ErrorBoundary";
import { TransferWidget } from "@components/Unlocked/Balances/TransferWidget";
import {
  Blockchain,
  ETH_NATIVE_MINT,
  SOL_NATIVE_MINT,
  toTitleCase,
} from "@coral-xyz/common";
import type { SearchParamsFor } from "@coral-xyz/recoil";
import {
  blockchainTokenData,
  useActiveEthereumWallet,
  useBlockchainActiveWallet,
  useLoader,
  useUser,
  keyringStoreState,
  user as userAtom,
  isAggregateWallets,
  autoLockSettings,
  enabledBlockchains,
  preferences,
  allUsers,
  backgroundClient,
  activeEthereumWallet as activeEthereumWalletAtom,
  activeSolanaWallet as activeSolanaWalletAtom,
  allWalletsDisplayed as allWalletsDisplayedAtom,
  availableBlockchains as availableBlockchainsAtom,
  enabledBlockchains as enabledBlockchainsAtom,
  blockchainKeyrings as blockchainKeyringsAtom,
  blockchainBalancesSorted as blockchainBalancesSortedAtom,
  blockchainNativeBalances as blockchainNativeBalancesAtom,
  useBlockchainTokens as useBlockchainTokensAtom,
  activeWallet as activeWalletAtom,
  activeWalletsWithData as activeWalletsWithDataAtom,
  activePublicKeys as activePublicKeysAtom,
  walletPublicKeys as walletPublicKeysAtom,
  featureGates as featureGatesAtom,
} from "@coral-xyz/recoil";
import { MaterialIcons } from "@expo/vector-icons";
import { createStackNavigator } from "@react-navigation/stack";
import { RecentActivityList } from "@screens/Unlocked/RecentActivityScreen";
import { WalletListScreen } from "@screens/Unlocked/WalletListScreen";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View,
  ScrollView,
  Pressable,
  StyleSheet,
  Text,
  View,
  FlatList,
} from "react-native";
import {
  useRecoilValueLoadable,
  useRecoilValue,
  useRecoilState,
  selector,
  atom,
} from "recoil";

import { BalanceSummaryWidget } from "./components/BalanceSummaryWidget";
import { TokenTables, UsdBalanceAndPercentChange } from "./components/Balances";
import type { Token } from "./components/index";

const ETH_DATA = {
  activeBlockchain: "ethereum",
  activePublicKeys: [
    "0x47Fe55c9CeeA5D29D942e1c64200814B06960D52",
    "9qw72J1uohccZGJsQmAAW6Nw4eSse5PkaNgYXzAB4cBM",
  ],
  publicKeys: {
    ethereum: {
      hdPublicKeys: [
        {
          publicKey: "0x47Fe55c9CeeA5D29D942e1c64200814B06960D52",
          name: "Wallet 1",
        },
      ],
      importedPublicKeys: [],
      ledgerPublicKeys: [],
    },
    solana: {
      hdPublicKeys: [
        {
          publicKey: "9qw72J1uohccZGJsQmAAW6Nw4eSse5PkaNgYXzAB4cBM",
          name: "Wallet 1",
        },
      ],
      importedPublicKeys: [],
      ledgerPublicKeys: [],
    },
  },
};

const SOL_DATA = {
  connectionUrl: "https://swr.xnfts.dev/rpc-proxy/",
  publicKey: "9qw72J1uohccZGJsQmAAW6Nw4eSse5PkaNgYXzAB4cBM",
  customSplTokenAccounts: {
    mintsMap: [],
    fts: {
      fungibleTokens: [
        {
          key: "9qw72J1uohccZGJsQmAAW6Nw4eSse5PkaNgYXzAB4cBM",
          mint: "11111111111111111111111111111111",
          authority: {
            _bn: {
              negative: 0,
              words: [
                53903932, 990199, 63176139, 57605447, 42730126, 14187108,
                13432003, 49023716, 11897672, 2152867, 0,
              ],
              length: 10,
              red: null,
            },
          },
          amount: "0",
          delegate: null,
          state: 1,
          isNative: null,
          delegatedAmount: { negative: 0, words: [0], length: 1, red: null },
          closeAuthority: null,
        },
      ],
      fungibleTokenMetadata: [null],
    },
    nfts: { nftTokens: [], nftTokenMetadata: [] },
  },
};

function useEthWhatever() {
  const ethBlockchainBalancesSorted = useRecoilValueLoadable(
    blockchainBalancesSortedAtom({
      blockchain: Blockchain.ETHEREUM,
      publicKey: "0x9288e5dd7017FFD235787c2064C7ec92aAf7687b",
    })
  );

  if (ethBlockchainBalancesSorted.state === "hasValue") {
    return ethBlockchainBalancesSorted.contents;
  } else {
    return [];
  }
}

function UserInfo() {
  const featureGates = useRecoilValueLoadable(featureGatesAtom);
  const allUsers = useRecoilValueLoadable(allUsersUU);
  const allWallets = useRecoilValueLoadable(allWalletsDisplayedAtom);
  const activeEthereumWallet = useRecoilValueLoadable(activeEthereumWalletAtom);
  const activeSolanaWallet = useRecoilValueLoadable(activeSolanaWalletAtom);
  const availableBlockchains = useRecoilValueLoadable(availableBlockchainsAtom);
  const enabledBlockchains = useRecoilValueLoadable(enabledBlockchainsAtom);
  const blockchainKeyrings = useRecoilValueLoadable(blockchainKeyringsAtom);
  const activeWallet = useRecoilValueLoadable(activeWalletAtom);
  const activeWalletsWithData = useRecoilValueLoadable(
    activeWalletsWithDataAtom
  );
  const activePublicKeys = useRecoilValueLoadable(activePublicKeysAtom);

  const ethBlockchainBalancesSorted = useEthWhatever();

  // const ethBlockchainBalancesSorted = useRecoilValueLoadable(
  //   blockchainBalancesSortedAtom({
  //     blockchain: Blockchain.ETHEREUM,
  //     publicKey: "0x9288e5dd7017FFD235787c2064C7ec92aAf7687b",
  //   }),
  // );

  const ethBlockchainNativeBalances = useRecoilValueLoadable(
    blockchainNativeBalancesAtom({
      blockchain: Blockchain.ETHEREUM,
      publicKey: "0x9288e5dd7017FFD235787c2064C7ec92aAf7687b",
    })
  );

  const solBlockchainBalancesSorted = useRecoilValueLoadable(
    blockchainBalancesSortedAtom({
      blockchain: Blockchain.SOLANA,
      publicKey: "9qw72J1uohccZGJsQmAAW6Nw4eSse5PkaNgYXzAB4cBM",
    })
  );

  const solBlockchainNativeBalances = useRecoilValueLoadable(
    blockchainNativeBalancesAtom({
      blockchain: Blockchain.SOLANA,
      publicKey: "9qw72J1uohccZGJsQmAAW6Nw4eSse5PkaNgYXzAB4cBM",
    })
  );

  const agr = useRecoilValueLoadable(isAggregateWallets);
  const autolock = useRecoilValueLoadable(autoLockSettings);
  const preferences2 = useRecoilValueLoadable(preferences);

  console.log("ethBlockchainBalancesSorted", ethBlockchainBalancesSorted);

  const data = {
    // featureGates,
    // activeWallet,
    // activeWalletsWithData,
    // activePublicKeys,
    // ethBlockchainBalancesSorted, // BROKEN
    // ethBlockchainNativeBalances, // BROKEN
    // solBlockchainBalancesSorted,
    // solBlockchainNativeBalances,
    // allUsers,
    // allWallets,
    // activeEthereumWallet,
    // activeSolanaWallet,
    // availableBlockchains,
    // enabledBlockchains,
    // blockchainKeyrings,
    // agr,
    // autolock,
    // preferences2,
  };

  if (ethBlockchainNativeBalances.state === "hasValue") {
    return (
      <>
        <Text style={{ fontSize: 14 }}>{JSON.stringify(data, null, 2)}</Text>
        <FlatList
          data={ethBlockchainBalancesSorted}
          renderItem={({ item }) => {
            return (
              <Text>
                {item.name} {item.displayBalance}
              </Text>
            );
          }}
        />
      </>
    );
  }
  return <Text style={{ fontSize: 14 }}>{JSON.stringify(data, null, 2)}</Text>;
}

// export const userUU = atom<{ username: string; uuid: string; jwt: string }>({
//   key: "user22",
//   default: selector({
//     key: "userDefault22",
//     get: async ({ get }) => {
//       const background = get(backgroundClient);
//       return background.request({
//         method: UI_RPC_METHOD_USER_READ,
//         params: [],
//       });
//     },
//   }),
// });
export const allUsersUU = atom({
  key: "user23",
  default: selector({
    key: "userDefault23",
    get: async ({ get }) => {
      try {
        const background = get(backgroundClient);
        const data = await background.request({
          method: UI_RPC_METHOD_ALL_USERS_READ,
          params: [],
        });
        return data;
      } catch (error) {
        console.log("AKL error", error);
        return [];
      }
    },
  }),
});

const Stack = createStackNavigator();
function BalancesTestScreen() {
  // const testy = useRecoilValue(userUU);
  // console.log("testy", testy);
  // const testy2 = useRecoilValue(allUsersUU);
  // console.log("testy2", testy2);
  // const bg = useRecoilValue(backgroundClient);
  // const userA = useRecoilValue(userAtom);
  // const allUsersA = useRecoilValue(allUsers);
  // const user = useUser();
  // const keyring = useRecoilValue(keyringStoreState);
  // const agr = useRecoilValue(isAggregateWallets); // BROKEN
  // const autolock = useRecoilValue(autoLockSettings); // BROKEN
  // const enabledBlockchains2 = useRecoilValue(enabledBlockchains); // BROKEN
  // const preferences2 = useRecoilValue(preferences); // BROKEN

  // useEffect(() => {
  //   async function f() {
  //     console.log("bglientdata init");
  //     const data = await bg.request({
  //       method: UI_RPC_METHOD_ALL_USERS_READ,
  //       params: [],
  //     });
  //     console.log("bgclientdata", data);
  //   }
  //
  //   f();
  // }, [bg]);

  const data = {
    // testy,
    // bg,
    // userA,
    // allUsersA,
    // user,
    // keyring,
    // agr,
    // autolock,
    // enabledBlockchains2,
    // preferences2,
  };

  return (
    <ScrollView
      style={{
        marginTop: 40,
        paddingTop: 80,
        flex: 1,
        backgroundColor: "yellow",
      }}
    >
      <Text>{JSON.stringify(data, null, 2)}</Text>
      <UserInfo />
    </ScrollView>
  );
}

export function BalancesNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="BalanceList"
      screenOptions={{ presentation: "modal" }}
    >
      <Stack.Screen
        name="wallet-picker"
        component={WalletListScreen}
        options={({ navigation }) => {
          return {
            title: "Wallets",
            headerLeft: undefined,
            headerRight: ({ tintColor }) => {
              return (
                <Pressable onPress={() => navigation.navigate("edit-wallets")}>
                  <MaterialIcons
                    name="settings"
                    size={24}
                    style={{ padding: 8 }}
                    color={tintColor}
                  />
                </Pressable>
              );
            },
          };
        }}
      />
      <Stack.Group screenOptions={{ headerShown: false }}>
        <Stack.Screen name="BalanceList" component={BalancesTestScreen} />
        <Stack.Screen name="BalanceList2" component={BalanceListScreen} />
      </Stack.Group>
      <Stack.Screen
        name="BalanceDetail"
        component={BalanceDetailScreen}
        options={({ route: { params } }) => {
          const title = `${toTitleCase(params.blockchain)} / ${
            params.token.ticker
          }`;
          return {
            title,
          };
        }}
      />
    </Stack.Navigator>
  );
}

function TokenHeader({
  blockchain,
  address,
  onPressOption,
}: SearchParamsFor.Token["props"]) {
  const wallet = useBlockchainActiveWallet(blockchain);
  const [token] = useLoader(
    blockchainTokenData({
      publicKey: wallet.publicKey.toString(),
      blockchain,
      tokenAddress: address,
    }),
    null
  );

  if (!token) {
    return null;
  }

  return (
    <View>
      <View>
        <TokenAmountHeader
          token={token}
          amount={token.nativeBalance}
          displayLogo={false}
        />
        <UsdBalanceAndPercentChange
          usdBalance={token.usdBalance}
          recentPercentChange={token.recentPercentChange}
        />
      </View>
      <View style={styles.tokenHeaderButtonContainer}>
        <TransferWidget
          token={token}
          blockchain={blockchain}
          address={address}
          rampEnabled={
            (blockchain === Blockchain.SOLANA && token.ticker === "SOL") ||
            (blockchain === Blockchain.ETHEREUM && token.ticker === "ETH")
          }
          onPressOption={onPressOption}
        />
      </View>
    </View>
  );
}

function BalanceDetailScreen({ route, navigation }) {
  const { blockchain, token } = route.params;
  const { address } = token;

  // We only use ethereumWallet here, even though its shared on the Solana side too.
  const ethereumWallet = useActiveEthereumWallet();
  if (!blockchain || !address) {
    return null;
  }

  const activityAddress =
    blockchain === Blockchain.ETHEREUM ? ethereumWallet.publicKey : address;
  const contractAddresses =
    blockchain === Blockchain.ETHEREUM ? [address] : undefined;

  const handlePressOption = (
    route: "Receive" | "Send" | "Swap",
    options: any
  ) => {
    const name = route === "Receive" ? "DepositSingle" : "SendTokenModal";
    navigation.push(name, options);
  };

  return (
    <Screen>
      <TokenHeader
        blockchain={blockchain}
        address={address}
        onPressOption={handlePressOption}
      />
      <RecentActivityList
        blockchain={blockchain}
        address={activityAddress}
        contractAddresses={contractAddresses}
        minimize
        style={{ marginTop: 0 }}
      />
    </Screen>
  );
}

function BalanceListScreen({ navigation }) {
  const onPressTokenRow = (blockchain: Blockchain, token: Token) => {
    navigation.push("BalanceDetail", { token, blockchain });
  };

  const handlePressOption = (
    route: "Receive" | "Send" | "Swap",
    options: any
  ) => {
    const name = route === "Receive" ? "DepositList" : "SendSelectTokenModal";
    navigation.push(name, options);
  };

  return (
    <Screen>
      <Margin bottom={18}>
        <BalanceSummaryWidget />
      </Margin>
      <Margin bottom={18}>
        <TransferWidget rampEnabled={false} onPressOption={handlePressOption} />
      </Margin>
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
  tokenHeaderButtonContainer: {
    justifyContent: "space-between",
    marginTop: 24,
  },
});
