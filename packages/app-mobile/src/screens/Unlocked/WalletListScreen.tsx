import type { Wallet, PublicKey } from "@@types/types";

import { useCallback } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Blockchain, walletAddressDisplay } from "@coral-xyz/common";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HardwareIcon, ImportedIcon, MnemonicIcon } from "~components/Icon";
import { ListItemWalletOverview } from "~components/ListItem";
import {
  CopyButtonIcon,
  ListRowSeparator,
  Margin,
  RoundedContainerGroup,
  Row,
  Screen,
  StyledText,
} from "~components/index";
import { getBlockchainLogo } from "~hooks/index";
import { useTheme } from "~hooks/useTheme";
import { useWallets } from "~hooks/wallets";

// function MainWalletListItem({
//   publicKey,
//   type,
//   name,
//   blockchain,
//   onPress,
//   balance,
// }) {
//   return (
//     <ListItem2
//       list
//       singleLine
//       hoverTheme
//       pressTheme
//       icon={<NetworkIcon size={18} blockchain={blockchain} />}
//       onPress={() => onPress({ blockchain, name, publicKey, type })}
//     >
//       <XStack flex={1} justifyContent="space-between">
//         <StyledText fontSize="$base" fontWeight="600">
//           {name}
//         </StyledText>
//         <StyledText fontSize="$base" fontWeight="600">
//           {balance}
//         </StyledText>
//       </XStack>
//     </ListItem2>
//   );
// }

export function MainWalletList({
  onPressWallet,
}: {
  onPressWallet: (b: Blockchain, p: PublicKey) => void;
}): JSX.Element {
  const { allWallets } = useWallets();

  const keyExtractor = (wallet: Wallet) => wallet.publicKey.toString();
  const renderItem = useCallback(
    ({ item: wallet }: { item: Wallet }) => {
      return (
        <ListItemWalletOverview
          grouped
          name={wallet.name}
          blockchain={wallet.blockchain}
          publicKey={wallet.publicKey}
          balance="$4,197.69 TODO"
          onPress={onPressWallet}
        />
      );

      // return (
      //   <MainWalletListItem
      //     name={wallet.name}
      //     type={wallet.type}
      //     publicKey={wallet.publicKey}
      //     blockchain={wallet.blockchain}
      //     onPress={onPressWallet}
      //     balance="$4,197.67"
      //   />
      // );
    },
    [onPressWallet]
  );

  return (
    <>
      <StyledText fontSize="$base" mb={8}>
        {allWallets.length} Wallets
      </StyledText>
      <RoundedContainerGroup>
        <FlatList
          data={allWallets}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
        />
      </RoundedContainerGroup>
    </>
  );
}

// NOTE(peter): copied from app-extension/src/components/common/WalletList.tsx
export function WalletListScreen({ navigation, route }): JSX.Element {
  const insets = useSafeAreaInsets();
  const { activeWallet, onSelectWallet, allWallets } = useWallets();

  const handlePressWallet = useCallback(
    (wallet: Wallet) => {
      onSelectWallet(wallet, () => {
        navigation.goBack();
      });
    },
    [onSelectWallet, navigation]
  );

  return (
    <Screen style={{ marginBottom: insets.bottom }}>
      <FlatList
        data={allWallets}
        ItemSeparatorComponent={() => <ListRowSeparator />}
        keyExtractor={(item) => item.publicKey.toString()}
        renderItem={({ item: wallet }) => {
          return (
            <WalletListItem
              name={wallet.name}
              publicKey={wallet.publicKey}
              type={wallet.type as string}
              blockchain={wallet.blockchain}
              onPress={handlePressWallet}
              icon={<CopyButtonIcon text={wallet.publicKey} />}
              isSelected={wallet.publicKey === activeWallet?.publicKey}
            />
          );
        }}
      />
    </Screen>
  );
}

function WalletListItem({
  blockchain,
  name,
  publicKey,
  type,
  icon,
  onPress,
  isSelected,
}: {
  blockchain: Blockchain;
  name: string;
  publicKey: string;
  type: string;
  icon?: JSX.Element | null;
  onPress: (wallet: Wallet) => void;
  isSelected: boolean;
}): JSX.Element {
  const theme = useTheme();
  return (
    <RoundedContainerGroup>
      <Pressable
        onPress={() => onPress({ blockchain, name, publicKey, type })}
        style={[
          styles.listItem,
          {
            backgroundColor: theme.custom.colors.nav,
          },
        ]}
      >
        <View style={styles.listItemLeft}>
          <Margin right={12}>
            <NetworkIcon blockchain={blockchain} />
          </Margin>
          <View>
            <StyledText
              color="$fontColor"
              fontWeight={isSelected ? "$semibold" : "$base"}
            >
              {name}
            </StyledText>
            <Row>
              <WalletTypeIcon
                type={type}
                fill={isSelected ? theme.custom.colors.secondary : undefined}
              />
              <Text
                style={{ fontSize: 14, color: theme.custom.colors.fontColor }}
              >
                {walletAddressDisplay(publicKey)}
              </Text>
            </Row>
          </View>
        </View>
        {icon ? icon : null}
      </Pressable>
    </RoundedContainerGroup>
  );
}

function NetworkIcon({
  size,
  blockchain,
}: {
  size?: number;
  blockchain: Blockchain;
}) {
  const logo = getBlockchainLogo(blockchain);
  return (
    <Image
      style={[styles.logoContainer, { width: size, height: size }]}
      source={logo}
    />
  );
}

function WalletTypeIcon({ type, fill }: { type: string; fill?: string }) {
  switch (type) {
    case "imported":
      return <ImportedIcon fill={fill} />;
    case "hardware":
      return <HardwareIcon fill={fill} />;
    default:
      return <MnemonicIcon fill={fill} />;
  }
}

const styles = StyleSheet.create({
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  listItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoContainer: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
});
