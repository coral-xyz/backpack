import type { PublicKey, Wallet } from "~types/types";

import { Suspense, useCallback, useState } from "react";
import { FlatList, View, Alert } from "react-native";

import { useSuspenseQuery } from "@apollo/client";
import { Blockchain } from "@coral-xyz/common";
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

import { gql } from "~src/graphql/__generated__";
import { useSession } from "~src/lib/SessionProvider";
import { coalesceWalletData } from "~src/lib/WalletUtils";

const QUERY_USER_WALLETS = gql(`
  query BottomSheetUserWallets {
    user {
      id
      wallets {
        edges {
          node {
            ...WalletFragment
          }
        }
      }
    }
  }
`);

function Container({ navigation }) {
  const { setActiveWallet } = useSession();
  const { data } = useSuspenseQuery(QUERY_USER_WALLETS);
  const { allWallets, activeWallet, selectActiveWallet } = useWallets();
  const { dismiss } = useBottomSheetModal();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const wallets = coalesceWalletData(data, allWallets);

  const handlePressSelect = useCallback(
    async (blockchain: Blockchain, publicKey: PublicKey) => {
      setLoadingId(publicKey);
      setActiveWallet({ blockchain, publicKey });
      selectActiveWallet({ blockchain, publicKey }, () => {
        setLoadingId(null);
        dismiss();
      });
    },
    [dismiss, selectActiveWallet, setActiveWallet]
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
