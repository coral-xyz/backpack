import type { StackScreenProps } from "@react-navigation/stack";

import { useState } from "react";

import { Blockchain } from "@coral-xyz/common";
import { Box } from "@coral-xyz/tamagui";

import { MessageList } from "~components/Messages";
import { SearchInput } from "~components/StyledTextInput";
import { Screen } from "~components/index";
import { ChatStackNavigatorParamList } from "~screens/Unlocked/Chat/ChatHelpers";

import { useChatHelper, type ChatRowData } from "./ChatHelpers";

export function ChatListScreen({
  navigation,
}: StackScreenProps<ChatStackNavigatorParamList, "ChatList">): JSX.Element {
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
