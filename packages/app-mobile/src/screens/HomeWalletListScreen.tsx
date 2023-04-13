import type { Wallet } from "@@types/types";

import { Suspense, useCallback } from "react";
import { FlatList } from "react-native";

import { Box } from "@coral-xyz/tamagui";

import { ListItemWalletOverview } from "~components/ListItem";
import { RoundedContainerGroup, Screen, StyledText } from "~components/index";
import { useWallets } from "~hooks/wallets";
import { BalanceSummaryWidget } from "~screens/Unlocked/components/BalanceSummaryWidget";

// TODO(tamagui)
const ListHeaderTitle = ({ title }: { title: string }): JSX.Element => (
  <StyledText fontSize="$base" color="$fontColor" mb={8} ml={18}>
    {title}
  </StyledText>
);

export function HomeWalletListScreen({ navigation }): JSX.Element {
  const { allWallets, onSelectWallet } = useWallets();

  const handlePressWallet = useCallback(
    (w: Wallet) => {
      onSelectWallet(w, () => {
        navigation.push("Main");
      });
    },
    [navigation, onSelectWallet]
  );

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
          onPress={handlePressWallet}
        />
      );
    },
    [handlePressWallet]
  );

  return (
    <Screen headerPadding>
      <Box mb={12}>
        <BalanceSummaryWidget />
      </Box>
      <ListHeaderTitle title={`${allWallets.length.toString()} Wallets`} />
      <RoundedContainerGroup>
        <FlatList
          data={allWallets}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
        />
      </RoundedContainerGroup>
    </Screen>
  );
}
