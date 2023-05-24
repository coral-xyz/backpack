import type { Blockchain } from "@coral-xyz/common";
import type { PublicKey } from "~types/types";

import { useCallback, useState } from "react";
import { FlatList, Pressable, View } from "react-native";

import {
  // toTitleCase,
  UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE,
  // walletAddressDisplay,
} from "@coral-xyz/common";
import {
  useActiveWallet,
  useBackgroundClient,
  usePrimaryWallets,
} from "@coral-xyz/recoil";
import { PaddedListItemSeparator, StyledText } from "@coral-xyz/tamagui";
import { MaterialIcons } from "@expo/vector-icons";
import { useBottomSheetModal } from "@gorhom/bottom-sheet";
import { useNavigation } from "@react-navigation/native";

import { BetterBottomSheet } from "~components/BottomSheetModal";
import { ListItemWallet, type Wallet } from "~components/ListItem";
import { useTheme } from "~hooks/useTheme";
import { useWallets } from "~hooks/wallets";

function WalletListPicker({ navigation }) {
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
    },
    [background],
  );

  const handlePressEdit = (
    blockchain: Blockchain,
    { name, publicKey, type }: Wallet,
  ) => {
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
  };

  const renderItem = useCallback(
    ({ item }) => {
      const isPrimary = !!primaryWallets.find(
        (x) => x.publicKey === item.publicKey,
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
    ],
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
      />
      <BlueLinkButton label="Add wallet" onPress={console.log} />
    </View>
  );
}

const BlueLinkButton = ({ onPress, label }): JSX.Element => (
  <Pressable style={{ padding: 8 }} onPress={onPress}>
    <StyledText alignSelf="center" fontSize="$lg" color="$accentBlue">
      {label}
    </StyledText>
  </Pressable>
);

export function WalletSwitcherButton(): JSX.Element {
  const navigation = useNavigation();
  const theme = useTheme();
  const activeWallet = useActiveWallet();
  const [isVisible, setIsVisible] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => {
          setIsVisible(true);
        }}
        style={{
          flexDirection: "row",
          paddingVertical: 8,
          paddingHorizontal: 22,
          borderRadius: 32,
          borderWidth: 2,
          backgroundColor: theme.custom.colors.nav,
          borderColor: theme.custom.colors.borderFull,
          alignItems: "center",
        }}
      >
        <StyledText fontSize="$base" color="$fontColor">
          {activeWallet.name}
        </StyledText>
        <MaterialIcons
          name="keyboard-arrow-down"
          size={24}
          color={theme.custom.colors.fontColor}
          style={{ marginLeft: 4 }}
        />
      </Pressable>
      <BetterBottomSheet
        isVisible={isVisible}
        resetVisibility={() => {
          setIsVisible(false);
        }}
      >
        <WalletListPicker navigation={navigation} />
      </BetterBottomSheet>
    </>
  );
}
