import type { Blockchain } from "@coral-xyz/common";
import type { Wallet } from "@coral-xyz/recoil";

import { Suspense, useCallback } from "react";
import { FlatList } from "react-native";

import { usePrimaryWallets } from "@coral-xyz/recoil";
import { PaddedListItemSeparator } from "@coral-xyz/tamagui";
import { ErrorBoundary } from "react-error-boundary";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ListItemWallet } from "~components/ListItem";
import {
  RoundedContainerGroup,
  ScreenError,
  ScreenLoading,
} from "~components/index";

import { useWallets } from "~src/hooks/wallets";
import { useSession } from "~src/lib/SessionProvider";

function WalletList2({ onPressItem }) {
  const { allWallets } = useWallets();
  const { setActiveWallet } = useSession();
  const primaryWallets = usePrimaryWallets();
  const insets = useSafeAreaInsets();

  const handleSelectWallet = useCallback(
    async (wallet: Wallet) => {
      await setActiveWallet(wallet);
    },
    [setActiveWallet]
  );

  const renderItem = useCallback(
    ({ item, index }) => {
      const isPrimary = !!primaryWallets.find(
        (x) => x.publicKey === item.publicKey
      );

      const isFirst = index === 0;
      const isLast = index === allWallets.length - 1;

      return (
        <RoundedContainerGroup
          disableTopRadius={!isFirst}
          disableBottomRadius={!isLast}
        >
          <ListItemWallet
            loading={false}
            name={item.name}
            publicKey={item.publicKey}
            type={item.type}
            blockchain={item.blockchain}
            selected={false}
            primary={isPrimary}
            onPressEdit={onPressItem}
            onSelect={handleSelectWallet}
            isCold={false}
            balance={5555.34}
          />
        </RoundedContainerGroup>
      );
    },
    [onPressItem, allWallets.length, handleSelectWallet, primaryWallets]
  );

  return (
    <FlatList
      data={allWallets}
      renderItem={renderItem}
      keyExtractor={(item) => item.publicKey}
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

function Container({ navigation }): JSX.Element {
  const handlePressItem = (
    blockchain: Blockchain,
    { name, publicKey, type }: Wallet
  ) => {
    navigation.navigate("edit-wallets-wallet-detail", {
      blockchain,
      publicKey,
      name,
      type,
    });
  };

  return <WalletList2 onPressItem={handlePressItem} />;
}

export function EditWalletsScreen({ navigation }): JSX.Element {
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
