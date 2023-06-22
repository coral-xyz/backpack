import {
  Suspense,
  useCallback,
  useLayoutEffect,
  useState,
  useTransition,
} from "react";
import { FlatList } from "react-native";

import { useSuspenseQuery } from "@apollo/client";
import { Separator } from "@coral-xyz/tamagui";
import { ErrorBoundary } from "react-error-boundary";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ArrowRightIcon } from "~components/Icon";
import { _ListItemOneLine } from "~components/ListItem";
import { UserAvatar } from "~components/UserAvatar";
import {
  RoundedContainerGroup,
  ScreenEmptyList,
  ScreenError,
  ScreenLoading,
} from "~components/index";

import { gql } from "~src/graphql/__generated__";
import { FriendListScreenProps } from "~src/navigation/FriendsNavigator";

const QUERY_USER_FRIENDS = gql(`
  query UserFriends {
    user {
      id
      friendship {
        friends {
          ...FriendFragment
        }
      }
    }
  }
`);

function Container({ navigation }: FriendListScreenProps): JSX.Element {
  const insets = useSafeAreaInsets();
  const { data } = useSuspenseQuery(QUERY_USER_FRIENDS);
  const friends = data.user?.friendship?.friends ?? [];

  const [_inputText, setInputText] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [isPending, startTransition] = useTransition();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        placeholder: "Search for your friends",
        onChangeText: (event) => {
          const text = event.nativeEvent.text.toLowerCase();
          setInputText(text);
          startTransition(() => {
            setSearchFilter(text);
          });
        },
      },
    });
  }, [navigation]);

  const handlePressUser = useCallback(
    (userId: string, username: string) => {
      navigation.push("FriendDetail", { userId, username });
    },
    [navigation]
  );

  const keyExtractor = (item) => item.id;
  const renderItem = useCallback(
    ({ item, index }) => {
      const isFirst = index === 0;
      const isLast = index === friends.length - 1;
      return (
        <RoundedContainerGroup
          disableTopRadius={!isFirst}
          disableBottomRadius={!isLast}
        >
          <_ListItemOneLine
            title={item.username}
            icon={<UserAvatar size={32} uri={item.avatar} />}
            iconAfter={<ArrowRightIcon />}
            onPress={() => handlePressUser(item.id, item.username)}
          />
        </RoundedContainerGroup>
      );
    },
    [handlePressUser, friends.length]
  );

  const filteredResults = friends.filter((f) => {
    return f.username.toLowerCase().includes(searchFilter);
  });

  return (
    <FlatList
      style={{
        opacity: isPending ? 0.8 : 1,
        paddingTop: 16,
        paddingHorizontal: 16,
      }}
      contentContainerStyle={{
        flexGrow: filteredResults.length === 0 ? 1 : undefined,
        paddingBottom: insets.bottom + 32,
      }}
      scrollEnabled={filteredResults.length > 0}
      contentInsetAdjustmentBehavior="automatic"
      data={filteredResults}
      renderItem={renderItem}
      ItemSeparatorComponent={Separator}
      keyExtractor={keyExtractor}
      ListEmptyComponent={
        <ScreenEmptyList
          title="No results"
          subtitle="Add some friends to see them here."
          iconName="person-add"
        />
      }
    />
  );
}

export function FriendListScreen({
  navigation,
  route,
}: FriendListScreenProps): JSX.Element {
  return (
    <ErrorBoundary
      fallbackRender={({ error }) => <ScreenError error={error} />}
    >
      <Suspense fallback={<ScreenLoading />}>
        <Container navigation={navigation} route={route} />
      </Suspense>
    </ErrorBoundary>
  );
}
