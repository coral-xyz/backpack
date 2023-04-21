import type { Wallet } from "@@types/types";

import { useCallback } from "react";
import { FlatList } from "react-native";

import { Box } from "@coral-xyz/tamagui";
import { useNavigation } from "@react-navigation/native";

import { ListItemWalletOverview } from "~components/ListItem";
import { RoundedContainerGroup, Screen, StyledText } from "~components/index";
import { useWalletBalance } from "~hooks/recoil";
import { useWallets } from "~hooks/wallets";
import { BalanceSummaryWidget } from "~screens/Unlocked/components/BalanceSummaryWidget";

// TODO(tamagui)
const ListHeaderTitle = ({ title }: { title: string }): JSX.Element => (
  <StyledText fontSize="$base" color="$fontColor" mb={8} ml={18}>
    {title}
  </StyledText>
);

function RenderItem({
  item: wallet,
  onPress,
}: {
  item: Wallet;
  onPress: any;
}): JSX.Element {
  const { data: balance } = useWalletBalance(wallet);
  return (
    <ListItemWalletOverview
      grouped
      name={wallet.name}
      blockchain={wallet.blockchain}
      publicKey={wallet.publicKey}
      balance={`$${balance.totalBalance}`}
      onPress={onPress}
    />
  );
}

export function HomeWalletListScreen(): JSX.Element {
  return (
    <Screen headerPadding>
      <Box mb={12}>
        <BalanceSummaryWidget />
      </Box>
      <WalletList />
    </Screen>
  );
}

function WalletList() {
  const navigation = useNavigation();
  const { allWallets, onSelectWallet } = useWallets();

  const handlePressWallet = useCallback(
    (w: Wallet) => {
      navigation.push("Main");
      onSelectWallet(w, console.log);
    },
    [navigation, onSelectWallet]
  );

  const keyExtractor = (wallet: Wallet) => wallet.publicKey.toString();
  const renderItem = useCallback(
    ({ item: wallet }: { item: Wallet }) => {
      return <RenderItem item={wallet} onPress={handlePressWallet} />;
    },
    [handlePressWallet]
  );

  return (
    <>
      <ListHeaderTitle title={`${allWallets.length.toString()} Wallets`} />
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
