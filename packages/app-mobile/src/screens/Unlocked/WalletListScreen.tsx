import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  Blockchain,
  UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE,
  walletAddressDisplay,
} from "@coral-xyz/common";
import {
  useAllWallets,
  useBackgroundClient,
  useBlockchainActiveWallet,
  useDehydratedWallets,
} from "@coral-xyz/recoil";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HardwareIcon, ImportedIcon, MnemonicIcon } from "~components/Icon";
import {
  CopyButtonIcon,
  ListRowSeparator,
  Margin,
  RoundedContainerGroup,
  Row,
  Screen,
} from "~components/index";
import { getBlockchainLogo, useTheme } from "~hooks/index";

type Wallet = {
  publicKey: string;
  blockchain: string;
  name: string;
  type: string;
};

// NOTE(peter): copied from app-extension/src/components/common/WalletList.tsx
export function WalletListScreen({ navigation, route }): JSX.Element {
  const insets = useSafeAreaInsets();
  const activeWallet = useBlockchainActiveWallet(Blockchain.SOLANA);
  const background = useBackgroundClient();
  const wallets = useAllWallets();
  const _dehydratedWallets = useDehydratedWallets();

  const activeWallets = wallets.filter((w) => !w.isCold);
  // const coldWallets = wallets.filter((w) => w.isCold);

  // Dehydrated public keys are keys that exist on the server but cannot be
  // used on the client as we don't have signing data, e.g. mnemonic, private
  // key or ledger derivation path
  const dehydratedWallets = _dehydratedWallets.map((w: any) => ({
    ...w,
    name: "", // TODO server side does not sync wallet names
    type: "dehydrated",
  }));

  const onSelectWallet = async (w: Wallet) => {
    await background.request({
      method: UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE,
      params: [w.publicKey.toString(), w.blockchain],
    });

    navigation.goBack();
  };

  return (
    <Screen style={{ marginBottom: insets.bottom }}>
      <FlatList
        data={activeWallets.concat(dehydratedWallets)}
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
              style={{
                fontSize: 16,
                fontFamily: isSelected
                  ? "Inter_600SemiBold"
                  : "Inter_400Regular",
                color: theme.custom.colors.fontColor,
              }}
            >
              {name}
            </Text>
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

function NetworkIcon({ blockchain }: { blockchain: Blockchain }) {
  const logo = getBlockchainLogo(blockchain);
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
