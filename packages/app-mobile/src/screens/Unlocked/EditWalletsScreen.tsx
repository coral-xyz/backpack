import type { Blockchain } from "@coral-xyz/common";
import type { PublicKey } from "~types/types";

import { Suspense, useCallback } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";

import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";

import {
  toTitleCase,
  UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE,
  walletAddressDisplay,
} from "@coral-xyz/common";
import {
  useActiveWallet,
  useAllWallets,
  useBackgroundClient,
  useDehydratedWallets,
  usePrimaryWallets,
  useWalletPublicKeys,
} from "@coral-xyz/recoil";
import { PaddedListItemSeparator } from "@coral-xyz/tamagui";
import { ErrorBoundary } from "react-error-boundary";

import { ContentCopyIcon, VerticalDotsIcon } from "~components/Icon";
import { ListItemWallet, type Wallet } from "~components/ListItem";
import {
  AddConnectWalletButton,
  ImportTypeBadge,
  Margin,
  RoundedContainerGroup,
  Screen,
  ScreenError,
  ScreenLoading,
  WalletAddressLabel,
} from "~components/index";

function WalletList2({ onPressItem }) {
  const background = useBackgroundClient();
  const activeWallet = useActiveWallet();
  const wallets = useAllWallets();
  const activeWallets = wallets.filter((w) => !w.isCold);
  const coldWallets = wallets.filter((w) => w.isCold);
  const primaryWallets = usePrimaryWallets();

  // Dehydrated public keys are keys that exist on the server but cannot be
  // used on the client as we don't have signing data, e.g. mnemonic, private
  // key or ledger derivation path
  const dehydratedWallets = useDehydratedWallets().map((w: any) => ({
    ...w,
    name: "", // TODO server side does not sync wallet names
    type: "dehydrated",
  }));

  // activeWallet={activeWallet}
  // activeWallets={activeWallets.concat(dehydratedWallets)}
  // coldWallets={coldWallets}

  const selectedWalletPublicKey = activeWallet.publicKey;
  const data = [...activeWallets, ...dehydratedWallets];

  const handleSelectWallet = useCallback(
    async (b: Blockchain, pk: PublicKey) => {
      await background.request({
        method: UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE,
        params: [pk, b],
      });
    },
    [background]
  );

  const renderItem = useCallback(
    ({ item, index }) => {
      const isPrimary = !!primaryWallets.find(
        (x) => x.publicKey === item.publicKey
      );

      const isFirst = index === 0;
      const isLast = index === data.length - 1;

      return (
        <RoundedContainerGroup
          disableTopRadius={!isFirst}
          disableBottomRadius={!isLast}
        >
          <ListItemWallet
            name={item.name}
            publicKey={item.publicKey}
            type={item.type}
            blockchain={item.blockchain}
            selected={item.publicKey === activeWallet.publicKey}
            primary={isPrimary}
            onPressEdit={onPressItem}
            onSelect={handleSelectWallet}
            isCold={false}
            balance={5555.34}
          />
        </RoundedContainerGroup>
      );
    },
    [selectedWalletPublicKey, onPressItem, data.length]
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.publicKey}
      ItemSeparatorComponent={PaddedListItemSeparator}
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

  const handlePressAddWallet = (blockchain: Blockchain) => {
    navigation.push("add-wallet", { blockchain });
  };

  return (
    <Screen>
      <WalletList2 onPressItem={handlePressItem} />
    </Screen>
  );
}

// const styles = StyleSheet.create({
//   sectionHeaderTitle: {
//     fontWeight: "500",
//     marginBottom: 8,
//   },
//   listItem: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//   },
//   listItemLeft: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
// });

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
