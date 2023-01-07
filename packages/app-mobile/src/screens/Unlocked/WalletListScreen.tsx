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

export function WalletListScreen({ navigation, route }): JSX.Element {
  // const { filter } = route.params;
  const activeWallet = useBlockchainActiveWallet(Blockchain.SOLANA);
  const background = useBackgroundClient();
  let wallets = useAllWallets();

  // if (filter) {
  //   wallets = wallets.filter(filter);
  // }

  const onSelectWallet = async (w: {
    publicKey: string;
    blockchain: string;
    name: string;
    type: string;
  }) => {
    await background.request({
      method: UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE,
      params: [w.publicKey.toString(), w.blockchain],
    });
  };

  return (
    <Screen>
      <FlatList
        data={wallets}
        ItemSeparatorComponent={() => <ListRowSeparator />}
        renderItem={({ item: wallet }) => {
          return (
            <WalletListItem
              name={wallet.name}
              publicKey={wallet.publicKey}
              type={wallet.type}
              blockchain={wallet.blockchain}
              onPress={onSelectWallet}
              icon={<CopyButtonIcon text={wallet.publicKey} />}
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
}: {
  blockchain: Blockchain;
  name: string;
  publicKey: string;
  type: string;
  icon?: JSX.Element | null;
  onPress: (blockchain: Blockchain, wallet: Wallet) => void;
}): JSX.Element {
  const theme = useTheme();
  return (
    <RoundedContainerGroup>
      <Pressable
        onPress={() => onPress(blockchain, { name, publicKey, type })}
        style={[
          styles.listItem,
          {
            backgroundColor: theme.custom.colors.nav,
          },
        ]}>
        <View style={styles.listItemLeft}>
          <Margin right={12}>
            <NetworkIcon blockchain={blockchain} />
          </Margin>
          <View>
            <Text>{name}</Text>
            <Text style={{ fontSize: 12 }}>
              {walletAddressDisplay(publicKey)}
            </Text>
          </View>
          {type ? (
            <Margin left={8}>
              <ImportTypeBadge type={type} />
            </Margin>
          ) : null}
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
