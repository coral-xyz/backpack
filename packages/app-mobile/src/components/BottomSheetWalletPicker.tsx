import type { Wallet } from "~types/types";

import { Suspense, useCallback, useMemo, useState } from "react";
import { FlatList, View, Alert, ActivityIndicator } from "react-native";

import { useSuspenseQuery } from "@apollo/client";
import {
  BottomSheetTitle,
  PaddedListItemSeparator,
  YStack,
} from "@coral-xyz/tamagui";
import { useBottomSheetModal } from "@gorhom/bottom-sheet";
import { ErrorBoundary } from "react-error-boundary";

import { ListItemWallet } from "~components/ListItem";
import { LinkButton__ as LinkButton, ScreenError } from "~components/index";
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

function Wrapper({ children }: { children: React.ReactNode }): JSX.Element {
  return <View style={{ height: 400 }}>{children}</View>;
}

function Container({ navigation }) {
  const { activeWallet, setActiveWallet } = useSession();
  const { data } = useSuspenseQuery(QUERY_USER_WALLETS);
  const { allWallets } = useWallets();
  const { dismiss } = useBottomSheetModal();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const wallets = useMemo(
    () => coalesceWalletData(data, allWallets),
    [data, allWallets]
  );

  const handlePressSelect = useCallback(
    async (wallet: Wallet) => {
      setLoadingId(wallet.publicKey);
      // if the delay is terrible, add await here
      setActiveWallet(wallet);
      setLoadingId(null);
      dismiss();
    },
    [dismiss, setActiveWallet]
  );

  const handlePressEdit = useCallback(
    (wallet: Wallet) => {
      dismiss();
      navigation.navigate("AccountSettings", {
        screen: "edit-wallets-wallet-detail",
        params: {
          name: wallet.name,
          publicKey: wallet.publicKey,
        },
      });
    },
    [dismiss, navigation]
  );

  const keyExtractor = (item) => item.publicKey;
  const renderItem = useCallback(
    ({ item }) => {
      return (
        <ListItemWallet
          name={item.name}
          type={item.type}
          publicKey={item.publicKey}
          blockchain={item.blockchain}
          isCold={item.isCold}
          selected={item.publicKey === activeWallet?.publicKey}
          loading={loadingId === item.publicKey}
          primary={item.isPrimary}
          balance={item.balance}
          onPressEdit={handlePressEdit}
          onSelect={handlePressSelect}
        />
      );
    },
    [loadingId, activeWallet?.publicKey, handlePressSelect, handlePressEdit]
  );

  return (
    <Wrapper>
      <BottomSheetTitle title="Wallets" />
      <FlatList
        data={wallets}
        keyExtractor={keyExtractor}
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
    </Wrapper>
  );
}

function FallbackComponent({ error }) {
  return (
    <Wrapper>
      <ScreenError error={error} />
    </Wrapper>
  );
}

export function BottomSheetWalletPicker({ navigation }): JSX.Element {
  return (
    <ErrorBoundary FallbackComponent={FallbackComponent}>
      <Suspense
        fallback={
          <Wrapper>
            <YStack f={1} ai="center" jc="center">
              <ActivityIndicator />
            </YStack>
          </Wrapper>
        }
      >
        <Container navigation={navigation} />
      </Suspense>
    </ErrorBoundary>
  );
}
