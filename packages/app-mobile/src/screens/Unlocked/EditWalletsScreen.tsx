import { useEffect } from "react";
import { Pressable, SectionList, StyleSheet,Text, View } from "react-native";
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

function WalletListItem({ wallet, onPress }): JSX.Element {
  const theme = useTheme();
  // return (
  //   <SettingsWalletRow
  //     name={wallet.name}
  //     publicKey={wallet.publicKey}
  //     icon={wallet.icon}
  //     onPress={onPress}
  //   />
  // );
  return (
    <Pressable
      style={[styles.listItem, { backgroundColor: theme.custom.colors.nav }]}
    >
      <View style={styles.listItemLeft}>
        <WalletAddressLabel name={wallet.name} publicKey={wallet.publicKey} />
        {wallet.type ? <ImportTypeBadge type={wallet.type} /> : null}
      </View>
      <IconPushDetail />
    </Pressable>
  );
}

export function EditWalletsScreen({ navigation }): JSX.Element {
  const blockchainKeyrings = useWalletPublicKeys();
  const sections = buildSectionList(blockchainKeyrings);

  const onPressItem = (blockchain: Blockchain, wallet: any) => {
    navigation.navigate("edit-wallets-wallet-detail", { blockchain, wallet });
  };

  const handlePressAddWallet = (blockchain: Blockchain) => {
    navigation.push("add-wallet", { blockchain });
  };

  return (
    <Screen>
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => item + index}
        renderItem={({ item }) => (
          <WalletListItem wallet={item} onPress={onPressItem} />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <SectionHeader title={title} />
        )}
        renderSectionFooter={() => (
          <Margin bottom={24} top={8}>
            <AddConnectWalletButton onPress={handlePressAddWallet} />
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
