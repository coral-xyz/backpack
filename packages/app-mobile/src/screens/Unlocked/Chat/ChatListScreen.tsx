import { Suspense, useState, useLayoutEffect } from "react";
import { View } from "react-native";

import { ErrorBoundary } from "react-error-boundary";

import { MessageList } from "~components/Messages";
import { ScreenError, ScreenLoading } from "~components/index";
import { ChatListScreenProps } from "~navigation/types";

import { type ChatRowData, useChatHelper } from "./ChatHelpers";

function Container({ navigation }: ChatListScreenProps): JSX.Element {
  const { allChats, requestCount, onRefreshChats, isRefreshingChats } =
    useChatHelper();
  const [searchFilter, setSearchFilter] = useState("");

  useLayoutEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        placeholder: "Search your messages",
        onChangeText: (event) => {
          setSearchFilter(event.nativeEvent.text.toLowerCase());
        },
      },
    });
  }, [navigation]);

  const handlePressMessage = (metadata: ChatRowData) => {
    navigation.push("ChatDetail", metadata);
  };

  const handlePressRequest = () => {
    navigation.push("ChatRequest");
  };

  const messages = allChats.filter((chat) => {
    return chat.name.toLowerCase().includes(searchFilter);
  });

  return (
    <MessageList
      requestCount={requestCount}
      allChats={messages}
      onPressRow={handlePressMessage}
      onPressRequest={handlePressRequest}
      onRefreshChats={onRefreshChats}
      isRefreshing={isRefreshingChats}
    />
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
