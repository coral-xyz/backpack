import { useState, useCallback } from "react";
import { FlatList, Text, View, Pressable } from "react-native";

import { walletAddressDisplay } from "@coral-xyz/common";
import { useActiveWallet } from "@coral-xyz/recoil";
import { StyledText } from "@coral-xyz/tamagui";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { BetterBottomSheet } from "~components/BottomSheetModal";
import { useTheme } from "~hooks/useTheme";
import { useWallets } from "~hooks/wallets";

const ListItem = ({ name, publicKey, type, blockchain }) => (
  <View style={{ height: 56, flexDirection: "row", alignItems: "center" }}>
    <Text>{name}</Text>
    <Text>{blockchain}</Text>
    <Text>{type}</Text>
    <Text>{walletAddressDisplay(publicKey)}</Text>
  </View>
);

function WalletListPicker() {
  const { allWallets } = useWallets();

  const renderItem = useCallback(({ item }) => {
    return (
      <ListItem
        name={item.name}
        publicKey={item.publicKey}
        type={item.type}
        blockchain={item.blockchain}
      />
    );
  }, []);

  return (
    <View>
      <FlatList
        data={allWallets}
        keyExtractor={(item) => item.publicKey.toString()}
        renderItem={renderItem}
      />
      <BlueLinkButton label="Add wallet" onPress={console.log} />
    </View>
  );
}

const BlueLinkButton = ({ onPress, label }): JSX.Element => (
  <Pressable onPress={onPress}>
    <StyledText alignSelf="center" fontSize="$lg" color="blue">
      {label}
    </StyledText>
  </Pressable>
);

export function WalletSwitcherButton(): JSX.Element {
  const theme = useTheme();
  const activeWallet = useActiveWallet();
  const [isVisible, setIsVisible] = useState(false);

  const handlePress = () => {
    setIsVisible(true);
    // navigation.navigate("wallet-picker");
  };

  return (
    <>
      <Pressable
        onPress={handlePress}
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
        <WalletListPicker />
      </BetterBottomSheet>
    </>
  );
}
