import type { Blockchain } from "@coral-xyz/common";
import type { PublicKey, Wallet } from "~types/types";

import { useCallback, useState } from "react";
import { FlatList, Pressable, View } from "react-native";

import { UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE } from "@coral-xyz/common";
import {
  useActiveWallet,
  useBackgroundClient,
  usePrimaryWallets,
} from "@coral-xyz/recoil";
import { PaddedListItemSeparator, StyledText, Theme } from "@coral-xyz/tamagui";
import { useBottomSheetModal } from "@gorhom/bottom-sheet";

import { ListItemWallet } from "~components/ListItem";
import { useWallets } from "~hooks/wallets";

const BlueLinkButton = ({ onPress, label }): JSX.Element => (
  <Pressable style={{ padding: 12 }} onPress={onPress}>
    <StyledText alignSelf="center" fontSize="$lg" color="$accentBlue">
      {label}
    </StyledText>
  </Pressable>
);

export function BottomSheetWalletPicker({ navigation }) {
  const { dismiss } = useBottomSheetModal();
  const background = useBackgroundClient();
  const { allWallets } = useWallets();
  const primaryWallets = usePrimaryWallets();
  const activeWallet = useActiveWallet();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handlePressSelect = useCallback(
    async (b: Blockchain, pk: PublicKey) => {
      setLoadingId(pk);
      await background.request({
        method: UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE,
        params: [pk, b],
      });
      setLoadingId(null);
      dismiss();
    },
    [background, dismiss]
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
      const isPrimary = !!primaryWallets.find(
        (x) => x.publicKey === item.publicKey
      );

      return (
        <ListItemWallet
          name={item.name}
          publicKey={item.publicKey}
          type={item.type}
          blockchain={item.blockchain}
          selected={item.publicKey === activeWallet.publicKey}
          loading={loadingId === item.publicKey}
          primary={isPrimary}
          isCold={false}
          balance={5555.34}
          onPressEdit={handlePressEdit}
          onSelect={handlePressSelect}
        />
      );
    },
    [
      loadingId,
      activeWallet.publicKey,
      primaryWallets,
      handlePressSelect,
      handlePressEdit,
    ]
  );

  return (
    <View style={{ height: 400 }}>
      <StyledText fontSize="$lg" textAlign="center" mb={18}>
        Wallets
      </StyledText>
      <FlatList
        data={allWallets}
        keyExtractor={(item) => item.publicKey}
        renderItem={renderItem}
        ItemSeparatorComponent={PaddedListItemSeparator}
        showsVerticalScrollIndicator={false}
      />
      <BlueLinkButton label="Add wallet" onPress={console.log} />
    </View>
  );
}
