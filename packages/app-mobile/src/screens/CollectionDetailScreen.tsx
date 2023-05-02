import { Suspense } from "react";
import { FlatList, View, Text } from "react-native";

import { useFragment_experimental } from "@apollo/client";
import { ErrorBoundary } from "react-error-boundary";

import { FullScreenLoading } from "~components/index";
import {
  NftNodeFragment,
  ListItem as _ListItem,
} from "~screens/CollectionListScreen";

function ListItem({ id }: { id: string }): JSX.Element {
  const { data: item } = useFragment_experimental({
    fragment: NftNodeFragment,
    fragmentName: "NftNodeFragment",
    from: {
      __typename: "Nft",
      id,
    },
  });

  console.log("debug1:ListItem:item", item);

  return <_ListItem item={item} />;
}

function Container({ navigation, route }: any): JSX.Element {
  const { nftIds } = route.params;
  console.log("debug1:nftIds", nftIds);

  return (
    <FlatList
      style={{ padding: 8 }}
      data={nftIds}
      numColumns={2}
      renderItem={({ item }) => {
        return <ListItem id={item} />;
      }}
    />
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
