import { useCallback, useState } from "react";
import { Alert, FlatList, Pressable, View } from "react-native";

import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";

// import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";

import { walletAddressDisplay } from "@coral-xyz/common";
import { useActiveWallet } from "@coral-xyz/recoil";
import {
  PaddedListItemSeparator,
  StyledText,
  XStack,
} from "@coral-xyz/tamagui";
import { MaterialIcons } from "@expo/vector-icons";
// import { useNavigation } from "@react-navigation/native";

import { BetterBottomSheet } from "~components/BottomSheetModal";
import { ContentCopyIcon, VerticalDotsIcon } from "~components/Icon";
import { getBlockchainLogo } from "~hooks/index";
import { useTheme } from "~hooks/useTheme";
import { useWallets } from "~hooks/wallets";

const CopyPublicKey = ({ publicKey }: { publicKey: string }) => {
  return (
    <Pressable
      onPress={async () => {
        await Clipboard.setStringAsync(publicKey);
        Alert.alert("Copied to clipboard", publicKey);
      }}
    >
      <XStack ai="center" backgroundColor="#eee" padding={4} borderRadius={4}>
        <StyledText fontSize="$sm" mr={4}>
          {walletAddressDisplay(publicKey)}
        </StyledText>
        <ContentCopyIcon size={18} />
      </XStack>
    </Pressable>
  );
};

const ListItem = ({ name, publicKey, blockchain, selected }: any) => {
  const logo = getBlockchainLogo(blockchain);
  console.log("debug3:selected", selected);
  return (
    <XStack
      ai="center"
      jc="space-between"
      height="$container"
      paddingHorizontal={16}
    >
      <Pressable
        style={{ flexDirection: "row", alignItems: "center" }}
        onPress={() => {
          Alert.alert("pressed", name);
        }}
      >
        <Image
          source={logo}
          style={{
            aspectRatio: 1,
            width: 24,
            height: 24,
            marginRight: 12,
          }}
        />
        <StyledText fontSize="$base" fontWeight={selected ? "$800" : undefined}>
          {name}
        </StyledText>
      </Pressable>
      <XStack ai="center">
        <CopyPublicKey publicKey={publicKey} />
        <Pressable
          onPress={() => {
            Alert.alert("edit wallet", name);
          }}
        >
          <VerticalDotsIcon />
        </Pressable>
      </XStack>
    </XStack>
  );
};

function WalletListPicker() {
  const { allWallets, activeWallet } = useWallets();
  console.log("debug3:allWallets", allWallets, activeWallet);

  const renderItem = useCallback(({ item }) => {
    return (
      <ListItem
        name={item.name}
        publicKey={item.publicKey}
        type={item.type}
        blockchain={item.blockchain}
        selected={item.publicKey === activeWallet.publicKey}
      />
    );
  }, []);

  return (
    <View style={{ height: 400 }}>
      <StyledText fontSize="$lg" textAlign="center" mb={18}>
        Wallets
      </StyledText>
      <FlatList
        style={{ backgroundColor: "white" }}
        data={allWallets}
        keyExtractor={(item) => item.publicKey.toString()}
        renderItem={renderItem}
        ItemSeparatorComponent={PaddedListItemSeparator}
      />
      <BlueLinkButton label="Add wallet" onPress={console.log} />
    </View>
  );
}

const BlueLinkButton = ({ onPress, label }): JSX.Element => (
  <Pressable style={{ padding: 8 }} onPress={onPress}>
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
