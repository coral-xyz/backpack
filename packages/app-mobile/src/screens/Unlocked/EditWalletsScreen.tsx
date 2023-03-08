import type { Blockchain } from "@coral-xyz/common";

import { Pressable, SectionList, StyleSheet, Text, View } from "react-native";

import {
  AddConnectWalletButton,
  ImportTypeBadge,
  Margin,
  RoundedContainerGroup,
  Screen,
  WalletAddressLabel,
} from "~components/index";
import { toTitleCase } from "@coral-xyz/common";
import { useWalletPublicKeys } from "@coral-xyz/recoil";
import { useTheme } from "~hooks/useTheme";
import { IconPushDetail } from "~screens/Unlocked/Settings/components/SettingsRow"; // TODO(peter) move this icon to icons

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
        type: "hardware",
      })),
    ],
  }));
}

function SectionHeader({ title }: { title: string }): JSX.Element {
  const theme = useTheme();
  return (
    <Text
      style={[
        styles.sectionHeaderTitle,
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

export function WalletListItem({
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
  type?: string;
  icon?: JSX.Element | null;
  onPress?: (blockchain: Blockchain, wallet: Wallet) => void;
}): JSX.Element {
  const theme = useTheme();
  return (
    <Pressable
      onPress={() => {
        if (onPress && type) {
          onPress(blockchain, { name, publicKey, type });
        }
      }}
      style={[
        styles.listItem,
        {
          backgroundColor: theme.custom.colors.nav,
        },
      ]}
    >
      <View style={styles.listItemLeft}>
        <WalletAddressLabel name={name} publicKey={publicKey} />
        {type ? (
          <Margin left={8}>
            <ImportTypeBadge type={type} />
          </Margin>
        ) : null}
      </View>
      {icon ? icon : null}
    </Pressable>
  );
}

function WalletList({
  onPressItem,
  onPressAddWallet,
}: {
  onPressItem: (blockchain: Blockchain, wallet: Wallet) => void;
  onPressAddWallet: (blockchain: Blockchain) => void;
}): JSX.Element {
  const blockchainKeyrings = useWalletPublicKeys();
  const sections = buildSectionList(blockchainKeyrings);

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item, index) => item + index}
      renderItem={({ section, item: wallet, index }) => {
        const blockchain = section.blockchain as Blockchain;
        const isFirst = index === 0;
        const isLast = index === section.data.length - 1;
        return (
          <RoundedContainerGroup
            disableTopRadius={!isFirst}
            disableBottomRadius={!isLast}
          >
            <WalletListItem
              name={wallet.name}
              publicKey={wallet.publicKey}
              type={wallet.type}
              blockchain={blockchain}
              onPress={onPressItem}
              icon={<IconPushDetail />}
            />
          </RoundedContainerGroup>
        );
      }}
      renderSectionHeader={({ section: { title } }) => (
        <SectionHeader title={title} />
      )}
      renderSectionFooter={({ section }) => (
        <Margin bottom={24} top={8}>
          <AddConnectWalletButton
            blockchain={section.blockchain}
            onPress={onPressAddWallet}
          />
        </Margin>
      )}
    />
  );
}

export function EditWalletsScreen({ navigation }): JSX.Element {
  const handlePressItem = (
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
      <WalletList
        onPressItem={handlePressItem}
        onPressAddWallet={handlePressAddWallet}
      />
    </Screen>
  );
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
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  listItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
});
