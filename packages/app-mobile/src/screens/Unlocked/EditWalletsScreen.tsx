import { useEffect } from "react";
import { Pressable, SectionList, StyleSheet, Text, View } from "react-native";
import {
  AddConnectWalletButton,
  ImportTypeBadge,
  Margin,
  Screen,
  WalletAddressLabel,
} from "@components";
import type { Blockchain } from "@coral-xyz/common";
import { toTitleCase } from "@coral-xyz/common";
import { useWalletPublicKeys } from "@coral-xyz/recoil";
import { useTheme } from "@hooks";
import {
  IconPushDetail,
  RoundedContainer,
  SettingsWalletRow,
} from "@screens/Unlocked/Settings/components/SettingsRow";

function buildSectionList(blockchainKeyrings: any) {
  return Object.entries(blockchainKeyrings).map(([blockchain, keyring]) => ({
    blockchain,
    title: toTitleCase(blockchain),
    data: [
      ...keyring.hdPublicKeys.map((k: any) => ({ ...k, type: "derived" })),
      ...keyring.importedPublicKeys.map((k: any) => ({
        ...k,
        type: "imported",
      })),
      ...keyring.ledgerPublicKeys.map((k: any) => ({
        ...k,
        type: "ledger",
      })),
    ],
  }));
}

function SectionHeader({ title }: { title: string }): JSX.Element {
  const theme = useTheme();
  return (
    <Text
      style={[
        styles.headerTitle,
        {
          color: theme.custom.colors.fontColor,
        },
      ]}
    >
      {title}
    </Text>
  );
}

type Wallet = {
  name: string;
  publicKey: string;
  type: string;
};

function WalletListItem({
  blockchain,
  name,
  publicKey,
  type,
  onPress,
}: {
  blockchain: Blockchain;
  name: string;
  publicKey: string;
  type: string;
  onPress: (blockchain: Blockchain, wallet: Wallet) => void;
}): JSX.Element {
  const theme = useTheme();
  return (
    <Pressable
      onPress={() => onPress(blockchain, { name, publicKey, type })}
      style={[styles.listItem, { backgroundColor: theme.custom.colors.nav }]}
    >
      <View style={styles.listItemLeft}>
        <WalletAddressLabel name={name} publicKey={publicKey} />
        {type ? <ImportTypeBadge type={type} /> : null}
      </View>
      <IconPushDetail />
    </Pressable>
  );
}

export function EditWalletsScreen({ navigation }): JSX.Element {
  const blockchainKeyrings = useWalletPublicKeys();
  const sections = buildSectionList(blockchainKeyrings);

  const onPressItem = (
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
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => item + index}
        renderItem={({ section, item: wallet }) => {
          const blockchain = section.blockchain as Blockchain;
          return (
            <WalletListItem
              name={wallet.name}
              publicKey={wallet.publicKey}
              type={wallet.type}
              blockchain={blockchain}
              onPress={onPressItem}
            />
          );
        }}
        renderSectionHeader={({ section: { title } }) => (
          <SectionHeader title={title} />
        )}
        renderSectionFooter={({ section }) => (
          <Margin bottom={24} top={8}>
            <AddConnectWalletButton
              blockchain={section.blockchain}
              onPress={handlePressAddWallet}
            />
          </Margin>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    fontWeight: "500",
    marginBottom: 8,
  },
  listItem: {
    borderRadius: 8,
    overflow: "hidden",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  listItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
});
