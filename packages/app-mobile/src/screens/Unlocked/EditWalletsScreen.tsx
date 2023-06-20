import type { Wallet } from "@coral-xyz/recoil";

import { Suspense, useCallback, useMemo } from "react";
import { FlatList } from "react-native";

import { useSuspenseQuery } from "@apollo/client";
import { PaddedListItemSeparator } from "@coral-xyz/tamagui";
import { ErrorBoundary } from "react-error-boundary";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ListItemWallet } from "~components/ListItem";
import {
  RoundedContainerGroup,
  ScreenError,
  ScreenLoading,
} from "~components/index";

import { gql } from "~src/graphql/__generated__";
import { useWallets } from "~src/hooks/wallets";
import { coalesceWalletData } from "~src/lib/WalletUtils";
import { EditWalletsScreenProps } from "~src/navigation/AccountSettingsNavigator";

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

function Container({ navigation }: EditWalletsScreenProps) {
  const { data } = useSuspenseQuery(QUERY_USER_WALLETS);
  const { allWallets } = useWallets();
  const insets = useSafeAreaInsets();

  const wallets = useMemo(
    () => coalesceWalletData(data, allWallets),
    [data, allWallets]
  );

  const handlePressEdit = useCallback(
    (wallet: Wallet) => {
      navigation.navigate("edit-wallets-wallet-detail", {
        name: wallet.name,
        publicKey: wallet.publicKey,
      });
    },
    [navigation]
  );

  const keyExtractor = (item: Wallet) => item.publicKey;
  const renderItem = useCallback(
    ({ item, index }) => {
      const isFirst = index === 0;
      const isLast = index === wallets.length - 1;

      return (
        <RoundedContainerGroup
          disableTopRadius={!isFirst}
          disableBottomRadius={!isLast}
        >
          <ListItemWallet
            name={item.name}
            type={item.type}
            publicKey={item.publicKey}
            blockchain={item.blockchain}
            isCold={item.isCold}
            selected={false}
            loading={false}
            primary={item.isPrimary}
            balance={item.balance}
            onPressEdit={handlePressEdit}
            onSelect={handlePressEdit}
          />
        </RoundedContainerGroup>
      );
    },
    [handlePressEdit, wallets.length]
  );

  return (
    <FlatList
      data={wallets}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ItemSeparatorComponent={PaddedListItemSeparator}
      style={{
        paddingTop: 16,
        paddingHorizontal: 16,
        marginBottom: insets.bottom,
      }}
      contentContainerStyle={{
        paddingBottom: 32,
      }}
    />
  );
}

export function EditWalletsScreen({
  navigation,
  route,
}: EditWalletsScreenProps): JSX.Element {
  return (
    <ErrorBoundary
      fallbackRender={({ error }) => <ScreenError error={error} />}
    >
      <Suspense fallback={<ScreenLoading />}>
        <Container navigation={navigation} route={route} />
      </Suspense>
    </ErrorBoundary>
  );
}
