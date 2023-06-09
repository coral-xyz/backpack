import type { PublicKey, Wallet } from "~types/types";

import { Suspense, useCallback, useState } from "react";
import { FlatList, View, Alert } from "react-native";

import { gql, useSuspenseQuery_experimental } from "@apollo/client";
import { Blockchain, formatUsd } from "@coral-xyz/common";
import { BottomSheetTitle, PaddedListItemSeparator } from "@coral-xyz/tamagui";
import { useBottomSheetModal } from "@gorhom/bottom-sheet";
import { ErrorBoundary } from "react-error-boundary";

import { ListItemWallet } from "~components/ListItem";
import {
  LinkButton__ as LinkButton,
  ScreenError,
  ScreenLoading,
} from "~components/index";
import { useWallets } from "~hooks/wallets";

const GET_USER_WALLETS = gql`
  query UserWallets {
    user {
      id
      wallets {
        edges {
          node {
            id
            chainId
            address
            isPrimary
            createdAt
            balances {
              id
              aggregate {
                valueChange
                value
                percentChange
                id
              }
            }
          }
        }
      }
    }
  }
`;

function Container({ navigation }) {
  const { data } = useSuspenseQuery_experimental(GET_USER_WALLETS);
  const { dismiss } = useBottomSheetModal();
  const { allWallets, activeWallet, selectActiveWallet } = useWallets();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // TODO: this is a hack, we should be able to get the wallets from the query
  const wallets = data.user.wallets.edges.map((edge) => {
    const a = allWallets.find(
      (wallet) => wallet.publicKey === edge.node.address
    );

    return {
      ...edge.node,
      publicKey: edge.node.address,
      isPrimary: edge.node.isPrimary,
      blockchain: edge.node.chainId.toLowerCase() as Blockchain,
      balance: formatUsd(edge.node.balances.aggregate.value),
      // TODO: this is a hack, we should be able to get the wallets from the query
      name: a?.name ?? "",
      type: a?.type ?? "",
    };
  });

  const handlePressSelect = useCallback(
    async (blockchain: Blockchain, publicKey: PublicKey) => {
      setLoadingId(publicKey);
      navigation.replace("TopTabsWalletDetail", {
        screen: "TokenList",
        params: {
          publicKey,
          blockchain,
        },
      });
      selectActiveWallet({ blockchain, publicKey }, () => {
        setLoadingId(null);
        dismiss();
      });
    },
    [dismiss, selectActiveWallet, navigation]
  );

  const handlePressEdit = useCallback(
    (blockchain: Blockchain, { name, publicKey, type }: Wallet) => {
      dismiss();
      navigation.push("AccountSettings", {
        screen: "edit-wallets-wallet-detail",
        params: {
          blockchain,
          publicKey,
          name,
          type,
        },
      });
    },
    [dismiss, navigation]
  );

  const renderItem = useCallback(
    ({ item }) => {
      return (
        <ListItemWallet
          name={item.name}
          publicKey={item.publicKey}
          type={item.type}
          blockchain={item.blockchain}
          selected={item.publicKey === activeWallet.publicKey}
          loading={loadingId === item.publicKey}
          primary={item.isPrimary}
          isCold={false}
          balance={item.balance}
          onPressEdit={handlePressEdit}
          onSelect={handlePressSelect}
        />
      );
    },
    [loadingId, activeWallet.publicKey, handlePressSelect, handlePressEdit]
  );

  return (
    <View style={{ height: 400 }}>
      <BottomSheetTitle title="Wallets" />
      <FlatList
        data={wallets}
        keyExtractor={(item) => item.publicKey}
        renderItem={renderItem}
        ItemSeparatorComponent={PaddedListItemSeparator}
        showsVerticalScrollIndicator={false}
      />
      <LinkButton
        color="$accentBlue"
        label="Add wallet"
        onPress={() => {
          Alert.alert("TODO");
        }}
      />
    </View>
  );
}

export function BottomSheetWalletPicker({ navigation }): JSX.Element {
  return (
    <ErrorBoundary
      fallbackRender={({ error }) => <ScreenError error={error} />}
    >
      <Suspense fallback={<ScreenLoading />}>
        <Container navigation={navigation} />
      </Suspense>
    </ErrorBoundary>
  );
}
