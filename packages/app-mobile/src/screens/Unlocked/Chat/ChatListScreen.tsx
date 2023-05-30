import { Suspense, useState, useLayoutEffect, useTransition } from "react";

import { Blockchain } from "@coral-xyz/common";
import { ErrorBoundary } from "react-error-boundary";

import { MessageList } from "~components/Messages";
import { Screen, ScreenError, ScreenLoading } from "~components/index";
import { ChatListScreenProps } from "~navigation/types";

import { type ChatRowData, useChatHelper } from "./ChatHelpers";

function Container({ navigation }: ChatListScreenProps): JSX.Element {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]); // TODO(types) user search type
  const [isPending, startTransition] = useTransition();

  const { allChats, requestCount, onRefreshChats, isRefreshingChats } =
    useChatHelper();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        onChangeText: (event) => {
          setSearch(event.nativeEvent.text);
          // startTransition(() => {
          //   handleSearch(event.nativeEvent.text);
          // });
        },
      },
    });
  }, [navigation]);

  console.log("debug4:search", search);
  console.log("debug4:searchResults", searchResults);
  console.log("debug4:isPending", isPending);

  const handlePressMessage = (metadata: ChatRowData) => {
    navigation.push("ChatDetail", metadata);
  };

  const handlePressRequest = () => {
    navigation.push("ChatRequest");
  };

  return (
    <Screen style={{ paddingTop: 0, paddingHorizontal: 0 }}>
      <MessageList
        requestCount={requestCount}
        allChats={allChats}
        onPressRow={handlePressMessage}
        onPressRequest={handlePressRequest}
        onRefreshChats={onRefreshChats}
        isRefreshing={isRefreshingChats}
      />
    </Screen>
  );
}

export function ChatListScreen({
  navigation,
  route,
}: ChatListScreenProps): JSX.Element {
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
