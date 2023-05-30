import { Suspense, useCallback } from "react";
import { FlatList } from "react-native";

import { Separator } from "@coral-xyz/tamagui";
import { ErrorBoundary } from "react-error-boundary";

import { ArrowRightIcon } from "~components/Icon";
import { _ListItemOneLine } from "~components/ListItem";
import { UserAvatar } from "~components/UserAvatar";
import {
  RoundedContainerGroup,
  Screen,
  ScreenEmptyList,
  ScreenError,
  ScreenLoading,
} from "~components/index";

const friends = [
  {
    avatar: "https://swr.xnfts.dev/avatars/kira",
    id: "29c33e60-d54a-4fe4-80e9-4bbfcc6c69b8",
    username: "kira",
    areFriends: true,
    requested: false,
    remoteRequested: false,
  },
  {
    avatar: "https://swr.xnfts.dev/avatars/monkey",
    id: "446a5f21-35b9-4248-970f-7b4558f57e21",
    username: "monkey",
    areFriends: true,
    requested: false,
    remoteRequested: false,
  },
  {
    avatar: "https://swr.xnfts.dev/avatars/ant",
    id: "50752e18-8796-4702-b140-a3d78960ee94",
    username: "ant",
    areFriends: true,
    requested: false,
    remoteRequested: false,
  },
  {
    avatar: "https://swr.xnfts.dev/avatars/tristan",
    id: "68daeda7-2c20-49ea-9dab-f7a3ebd45ab5",
    username: "tristan",
    areFriends: true,
    requested: false,
    remoteRequested: false,
  },
  {
    avatar: "https://swr.xnfts.dev/avatars/peter",
    id: "6ecf7d82-095d-4fa3-9830-3567b286066d",
    username: "peter",
    areFriends: true,
    requested: false,
    remoteRequested: false,
  },
  {
    avatar: "https://swr.xnfts.dev/avatars/nokiamon",
    id: "7888a467-f6f1-4a06-89b1-c0eaaf0f5574",
    username: "nokiamon",
    areFriends: true,
    requested: false,
    remoteRequested: false,
  },
  {
    avatar: "https://swr.xnfts.dev/avatars/trucy",
    id: "7c01a3a2-dc39-4369-afb8-0dd2189412fc",
    username: "trucy",
    areFriends: true,
    requested: false,
    remoteRequested: false,
  },
  {
    avatar: "https://swr.xnfts.dev/avatars/hophip",
    id: "87e88b47-5de3-4a51-bd4b-fa987aa40032",
    username: "hophip",
    areFriends: true,
    requested: false,
    remoteRequested: false,
  },
  {
    avatar: "https://swr.xnfts.dev/avatars/demo",
    id: "8dc021d4-517d-4619-8aa0-c6595f3c086e",
    username: "demo",
    areFriends: true,
    requested: false,
    remoteRequested: false,
  },
  {
    avatar: "https://swr.xnfts.dev/avatars/john",
    id: "92cb6e9b-15ba-42de-9fb6-51ae5e72b431",
    username: "john",
    areFriends: true,
    requested: false,
    remoteRequested: false,
  },
  {
    avatar: "https://swr.xnfts.dev/avatars/matt",
    id: "b580347f-2ec8-4600-8af1-0f5982dc93e1",
    username: "matt",
    areFriends: true,
    requested: false,
    remoteRequested: false,
  },
  {
    avatar: "https://swr.xnfts.dev/avatars/liz",
    id: "e9f6db2f-b502-473b-8c99-af61ebf7a0dd",
    username: "liz",
    areFriends: true,
    requested: false,
    remoteRequested: false,
  },
  {
    avatar: "https://swr.xnfts.dev/avatars/armani",
    id: "ee7ce804-44b2-4360-bfbb-28e14cd0499b",
    username: "armani",
    areFriends: true,
    requested: false,
    remoteRequested: false,
  },
  {
    avatar: "https://swr.xnfts.dev/avatars/solwise",
    id: "f02f174c-c2cf-4951-a786-aa7b6419667e",
    username: "solwise",
    areFriends: true,
    requested: false,
    remoteRequested: false,
  },
];

function Container({ navigation }: any): JSX.Element {
  const data = friends;

  const handlePressUser = useCallback(
    (userId: string, username: string) => {
      navigation.push("FriendDetail", { userId, username });
    },
    [navigation]
  );

  const keyExtractor = useCallback((item) => item.id, []);
  const renderItem = useCallback(
    ({ item }) => {
      return (
        <_ListItemOneLine
          title={item.username}
          icon={<UserAvatar size={32} uri={item.avatar} />}
          iconAfter={<ArrowRightIcon />}
          onPress={() => handlePressUser(item.id, item.username)}
        />
      );
    },
    [handlePressUser]
  );

  return (
    <Screen>
      <RoundedContainerGroup>
        <FlatList
          data={data}
          renderItem={renderItem}
          ItemSeparatorComponent={Separator}
          keyExtractor={keyExtractor}
          ListEmptyComponent={
            <ScreenEmptyList
              title="You have no friends!"
              subtitle="Go add some"
              iconName="settings"
            />
          }
        />
      </RoundedContainerGroup>
    </Screen>
  );
}

export function FriendListScreen({ navigation }): JSX.Element {
  return (
    <ErrorBoundary
      fallbackRender={({ error }) => <ScreenError error={error} />}
    >
      <Suspense fallback={<ScreenLoading />}>
        <Container navigation={navigation} />
      </Suspense>
    </ErrorBoundary>
  );
}
