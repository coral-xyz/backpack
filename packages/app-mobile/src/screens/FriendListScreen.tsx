import { memo, Suspense, useCallback, useMemo } from "react";
import { FlatList, SectionList } from "react-native";

import { Image } from "expo-image";

import { Separator } from "@coral-xyz/tamagui";
import { ErrorBoundary } from "react-error-boundary";

import { ArrowRightIcon } from "~components/Icon";
import { _ListItemOneLine } from "~components/ListItem";
import {
  RoundedContainerGroup,
  Screen,
  ScreenEmptyList,
  ScreenError,
  ScreenLoading,
} from "~components/index";

function UserList() {
  const data = Array.from({ length: 10 }).map(() => {
    return {
      title: "armani",
      iconUrl:
        "https://images.xnfts.dev/cdn-cgi/image/fit=contain,width=120,height=120,quality=85/https://swr.xnfts.dev/avatars/backpack_dev/1681404388701?size=120",
    };
  });

  return (
    <RoundedContainerGroup>
      <FlatList
        data={data}
        ListEmptyComponent={
          <ScreenEmptyList
            title="You have no friends!"
            subtitle="Go add some"
            iconName="settings"
          />
        }
        ItemSeparatorComponent={Separator}
        renderItem={({ item }) => {
          return (
            <_ListItemOneLine
              title={item.title}
              icon={
                <Image
                  source={{
                    uri: "https://images.xnfts.dev/cdn-cgi/image/fit=contain,width=120,height=120,quality=85/https://swr.xnfts.dev/avatars/backpack_dev/1681404388701?size=120",
                  }}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 64,
                    aspectRatio: 1,
                  }}
                />
              }
              iconAfter={<ArrowRightIcon />}
            />
          );
        }}
      />
    </RoundedContainerGroup>
  );
}

function Container(): JSX.Element {
  return (
    <Screen>
      <UserList />
    </Screen>
  );
}

export function FriendListScreen(): JSX.Element {
  return (
    <ErrorBoundary
      fallbackRender={({ error }) => <ScreenError error={error} />}
    >
      <Suspense fallback={<ScreenLoading />}>
        <Container />
      </Suspense>
    </ErrorBoundary>
  );
}
