import type { StackScreenProps } from "@react-navigation/stack";

import { Suspense, useState } from "react";

import { Blockchain } from "@coral-xyz/common";
import { Box } from "@coral-xyz/tamagui";
import { ErrorBoundary } from "react-error-boundary";

import { MessageList } from "~components/Messages";
import { SearchInput } from "~components/StyledTextInput";
import { Screen, ScreenError, ScreenLoading } from "~components/index";
import { ChatStackNavigatorParamList } from "~screens/Unlocked/Chat/ChatHelpers";

import { type ChatRowData, useChatHelper } from "./ChatHelpers";

type ChatListScreenProps = StackScreenProps<
  ChatStackNavigatorParamList,
  "ChatList"
>;

function Container({ navigation }: ChatListScreenProps): JSX.Element {
  const [searchResults, setSearchResults] = useState([]); // TODO(types) user search type
  const {
    allChats,
    requestCount,
    onRefreshChats,
    isRefreshingChats,
    searchUsersByBlockchain,
  } = useChatHelper();

  const handleSearch = async (address: string) => {
    const results = await searchUsersByBlockchain({
      address,
      // TODO pass in blockchain
      blockchain: Blockchain.SOLANA,
    });

    setSearchResults(results);
  };

  const handlePressMessage = (metadata: ChatRowData) => {
    navigation.push("ChatDetail", metadata);
  };

  const handlePressRequest = () => {
    navigation.push("ChatRequest");
  };

  return (
    <Screen style={{ paddingTop: 8 }}>
      <Box marginBottom={8}>
        <SearchInput
          placeholder="Enter a username or address"
          onChangeText={handleSearch}
        />
      </Box>
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
