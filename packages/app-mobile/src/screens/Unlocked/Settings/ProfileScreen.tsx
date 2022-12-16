import { useState } from "react";
import { SectionList, StyleSheet, Text, View } from "react-native";
import {
  AddConnectWalletButton,
  Avatar,
  Margin,
  RoundedContainerGroup,
  Screen,
} from "@components";
import { ExpandCollapseIcon } from "@components/Icon";
import type { Blockchain } from "@coral-xyz/common";
import { toTitleCase } from "@coral-xyz/common";
import {
  useActiveWallets,
  useUser,
  useWalletPublicKeys,
} from "@coral-xyz/recoil";
import { useTheme } from "@hooks";
import { WalletListItem } from "@screens/Unlocked/EditWalletsScreen";
import { SettingsList } from "@screens/Unlocked/Settings/components/SettingsList";

export function ProfileScreen({ navigation }) {
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
    <Screen style={{ paddingTop: 32 }}>
      <WalletLists
        onPressItem={handlePressItem}
        onPressAddWallet={handlePressAddWallet}
      />
    </Screen>
  );
}

function AvatarHeader() {
  const { username } = useUser();
  const theme = useTheme();
  return (
    <View style={{ alignItems: "center", marginBottom: 24 }}>
      <Avatar />
      {username ? (
        <Text
          style={[
            styles.usernameText,
            {
              color: theme.custom.colors.fontColor,
            },
          ]}
        >
          gm @{username}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  usernameText: {
    textAlign: "center",
    fontWeight: "500",
    fontSize: 18,
    lineHeight: 28,
    marginTop: 8,
    marginBottom: 12,
  },
});

function buildSectionList(blockchainKeyrings: any, activeWallets: any[]) {
  return Object.entries(blockchainKeyrings).map(([blockchain, keyring]) => {
    const activeWallet = activeWallets.filter(
      (a) => a.blockchain === blockchain
    )[0];

    const data = [
      ...keyring.hdPublicKeys.map((k: any) => ({ ...k, type: "derived" })),
      ...keyring.importedPublicKeys.map((k: any) => ({
        ...k,
        type: "imported",
      })),
      ...keyring.ledgerPublicKeys.map((k: any) => ({
        ...k,
        type: "hardware",
      })),
    ].filter(({ publicKey }: any) => {
      return activeWallet.publicKey !== publicKey;
    });

    return {
      blockchain,
      title: toTitleCase(blockchain),
      data: [activeWallet, ...data],
    };
  });
}

type Wallet = {
  name: string;
  publicKey: string;
  type: string;
};

function WalletLists({
  onPressItem,
  onPressAddWallet,
}: {
  onPressItem: (blockchain: Blockchain, wallet: Wallet) => void;
  onPressAddWallet: (blockchain: Blockchain) => void;
}): JSX.Element {
  const blockchainKeyrings = useWalletPublicKeys();
  const activeWallets = useActiveWallets();
  const sections = buildSectionList(blockchainKeyrings, activeWallets);
  const [expandedSections, setExpandedSections] = useState(new Set());

  const handleToggle = (blockchain: Blockchain) => {
    const newExpandedSections = new Set(expandedSections);
    if (newExpandedSections.has(blockchain)) {
      newExpandedSections.delete(blockchain);
    } else {
      newExpandedSections.add(blockchain);
    }

    setExpandedSections(newExpandedSections);
  };

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item, index) => item + index}
      extraData={expandedSections}
      renderItem={({ section, item: wallet, index }) => {
        const blockchain = section.blockchain as Blockchain;
        const isFirst = index === 0;
        const isLast = index === section.data.length - 1;
        const isExpanded = expandedSections.has(blockchain);

        if (!isExpanded && !isFirst) {
          return null;
        }

        const disableBottomRadius = expandedSections.has(blockchain) && !isLast;

        return (
          <RoundedContainerGroup
            disableTopRadius={!isFirst}
            disableBottomRadius={disableBottomRadius}
          >
            <WalletListItem
              name={wallet.name}
              publicKey={wallet.publicKey}
              type={wallet.type}
              blockchain={blockchain}
              onPress={isFirst ? handleToggle : onPressItem}
              icon={
                isFirst ? <ExpandCollapseIcon isExpanded={isExpanded} /> : null
              }
            />
          </RoundedContainerGroup>
        );
      }}
      renderSectionFooter={({ section }) => (
        <Margin bottom={24} top={8}>
          <AddConnectWalletButton
            blockchain={section.blockchain}
            onPress={onPressAddWallet}
          />
        </Margin>
      )}
      ListHeaderComponent={AvatarHeader}
      ListFooterComponent={SettingsList}
    />
  );
}
