import type { Wallet } from "@@types/types";

import { Suspense, useCallback } from "react";
import { FlatList, ActivityIndicator, Text } from "react-native";

import { gql, useSuspenseQuery_experimental } from "@apollo/client";
// import { walletPublicKeyData } from "@coral-xyz/recoil";
import { Box } from "@coral-xyz/tamagui";
import { useNavigation } from "@react-navigation/native";
import { ErrorBoundary } from "react-error-boundary";
// import { useRecoilValue } from "recoil";

import { ListItemWalletOverview } from "~components/ListItem";
import { RoundedContainerGroup, Screen, StyledText } from "~components/index";
// import { useWalletBalance } from "~hooks/recoil";
import { useWallets } from "~hooks/wallets";
import { BalanceSummaryWidget } from "~screens/Unlocked/components/BalanceSummaryWidget";

// TODO(tamagui)
const ListHeaderTitle = ({ title }: { title: string }): JSX.Element => (
  <StyledText fontSize="$base" color="$fontColor" mb={8} ml={18}>
    {title}
  </StyledText>
);

const GET_WALLET_DATA = gql`
  query WalletData($chainId: ChainID!, $address: String!) {
    wallet(chainId: $chainId, address: $address) {
      id
      balances {
        aggregateValue
      }
    }
  }
`;

function ListItemData({ wallet, onPress }: { wallet: Wallet }): JSX.Element {
  // TODO(peter/graphql): this request needs to fetch all of the balances
  const { data } = useSuspenseQuery_experimental(GET_WALLET_DATA, {
    variables: {
      chainId: wallet.blockchain.toUpperCase(),
      address: wallet.publicKey,
    },
  });

  const balance = data.wallet.balances?.aggregateValue?.toFixed(2) ?? "$0.00";

  return (
    <ListItemWalletOverview
      grouped
      name={wallet.name}
      blockchain={wallet.blockchain}
      publicKey={wallet.publicKey}
      balance={`$${balance}`}
      onPress={onPress}
    />
  );
}

function ListItem({
  item: wallet,
  onPress,
}: {
  item: Wallet;
  onPress: any;
}): JSX.Element {
  // const { data: balance } = useWalletBalance(wallet);
  return (
    <ErrorBoundary fallbackRender={({ error }) => <Text>{error.message}</Text>}>
      <Suspense>
        <ListItemData wallet={wallet} onPress={onPress} />
      </Suspense>
    </ErrorBoundary>
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
      return <ListItem item={wallet} onPress={handlePressWallet} />;
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

function Container() {
  return (
    <Screen headerPadding>
      <Box mb={12}>
        <BalanceSummaryWidget />
      </Box>
      <WalletList />
    </Screen>
  );
}

export function HomeWalletListScreen({ navigation }: any): JSX.Element {
  return (
    <ErrorBoundary fallbackRender={({ error }) => <Text>{error.message}</Text>}>
      <Suspense fallback={<ActivityIndicator size="large" />}>
        <Container />
      </Suspense>
    </ErrorBoundary>
  );
}
