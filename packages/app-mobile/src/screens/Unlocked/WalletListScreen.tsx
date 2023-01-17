import { useEffect, useState } from "react";
import {
  Button,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  CopyButtonIcon,
  ImportTypeBadge,
  ListRowSeparator,
  Margin,
  RoundedContainerGroup,
  Row,
  Screen,
  WalletAddressLabel,
} from "@components";
import {
  Blockchain,
  UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE,
  walletAddressDisplay,
} from "@coral-xyz/common";
import {
  useAllWallets,
  useBackgroundClient,
  useBlockchainActiveWallet,
} from "@coral-xyz/recoil";
import { useBlockchainLogo, useTheme } from "@hooks";

import { HardwareIcon, ImportedIcon, MnemonicIcon } from "@components/Icon";



type Wallet = {
  publicKey: string;
  blockchain: string;
  name: string;
  type: string;
};

export function WalletListScreen({ navigation, route }): JSX.Element {
  // const { filter } = route.params;
  const activeWallet = useBlockchainActiveWallet(Blockchain.SOLANA);
  const background = useBackgroundClient();
  const wallets = useAllWallets();

  // if (filter) {
  //   wallets = wallets.filter(filter);
  // }

  const onSelectWallet = async (w: Wallet) => {
    await background.request({
      method: UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE,
      params: [w.publicKey.toString(), w.blockchain],
    });

    navigation.goBack();
  };

  return (
    <Screen>
      <FlatList
        data={wallets}
        ItemSeparatorComponent={() => <ListRowSeparator />}
        keyExtractor={(item) => item.publicKey.toString()}
        renderItem={({ item: wallet }) => {
          return (
            <WalletListItem
              name={wallet.name}
              publicKey={wallet.publicKey}
              type={wallet.type}
              blockchain={wallet.blockchain}
              onPress={onSelectWallet}
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
            <Text
              style={{ fontSize: 16, fontWeight: isSelected ? "600" : "500" }}
            >
              {name}
            </Text>
            <Row>
              <WalletTypeIcon
                type={type}
                fill={isSelected ? theme.custom.colors.secondary : undefined}
              />
              <Text style={{ fontSize: 14 }}>
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

function NetworkIcon({ blockchain }: { blockchain: Blockchain }) {
  const logo = useBlockchainLogo(blockchain);
  return <Image style={styles.logoContainer} source={logo} />;
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
  sectionHeaderTitle: {
    fontWeight: "500",
    marginBottom: 8,
  },
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
