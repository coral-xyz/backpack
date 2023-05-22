import type { Blockchain } from "@coral-xyz/common";
import type { Wallet } from "~types/types";

import { useState } from "react";
import { SectionList } from "react-native";

import { toTitleCase } from "@coral-xyz/common";
import { useActiveWallets, useWalletPublicKeys } from "@coral-xyz/recoil";

import { ExpandCollapseIcon } from "~components/Icon";
import {
  AddConnectWalletButton,
  Margin,
  RoundedContainerGroup,
} from "~components/index";
import { WalletListItem } from "~screens/Unlocked/EditWalletsScreen";

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

function WalletLists({
  ListHeaderComponent,
  ListFooterComponent,
  onPressItem,
  onPressAddWallet,
}: {
  ListHeaderComponent?: JSX.Element;
  ListFooterComponent?: JSX.Element;
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
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
    />
  );
}
