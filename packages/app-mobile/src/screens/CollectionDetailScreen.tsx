import { Suspense, useCallback, useMemo } from "react";
import { FlatList, Pressable, Text, Image } from "react-native";

import { useFragment_experimental } from "@apollo/client";
import { useActiveWallet } from "@coral-xyz/recoil";
import { XStack, StyledText } from "@coral-xyz/tamagui";
import { ErrorBoundary } from "react-error-boundary";

import {
  FullScreenLoading,
  Screen,
  RoundedContainerGroup,
} from "~components/index";
import { NftNodeFragment } from "~screens/CollectionListScreen";

function ListItem({ id, onPress }: { id: string; onPress: any }): JSX.Element {
  const { data: item } = useFragment_experimental({
    fragment: NftNodeFragment,
    fragmentName: "NftNodeFragment",
    from: {
      __typename: "Nft",
      id,
    },
  });

  console.log("debug3:item", item);

  return (
    <Pressable
      style={{ flex: 1, marginBottom: 12, borderRadius: 16 }}
      onPress={() => onPress(item)}
    >
      <Image
        source={{ uri: item.image }}
        style={{ borderRadius: 12, width: "100%", aspectRatio: 1 }}
      />
      <XStack mt={8}>
        <StyledText
          fontSize="$base"
          numberOfLines={1}
          ellipsizeMode="tail"
          maxWidth="90%"
        >
          {item.name}
        </StyledText>
      </XStack>
    </Pressable>
  );
}

function Container({ navigation, route }: any): JSX.Element {
  const activeWallet = useActiveWallet();
  const { nftIds } = route.params;

  const handlePressItem = useCallback(
    (item) => {
      navigation.push("CollectionItemDetail", {
        id: item.id,
        title: item.name,
        blockchain: activeWallet.blockchain,
      });
    },
    [navigation, activeWallet.blockchain]
  );

  const keyExtractor = (item: string) => item;
  const renderItem = useCallback(
    ({ item }: { item: string }) => {
      return <ListItem id={item} onPress={handlePressItem} />;
    },
    [handlePressItem]
  );

  const numColumns = 2;
  const gap = 12;

  return (
    <Screen>
      <RoundedContainerGroup style={{ padding: 12 }}>
        <FlatList
          data={nftIds}
          numColumns={numColumns}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={{ gap }}
          columnWrapperStyle={{ gap }}
        />
      </RoundedContainerGroup>
    </Screen>
  );
}

export function CollectionDetailScreen({
  navigation,
  route,
}: any): JSX.Element {
  return (
    <ErrorBoundary fallbackRender={({ error }) => <Text>{error.message}</Text>}>
      <Suspense fallback={<FullScreenLoading />}>
        <Container navigation={navigation} route={route} />
      </Suspense>
    </ErrorBoundary>
  );
}
