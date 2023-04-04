import type { StackScreenProps } from "@react-navigation/stack";

import { Box } from "@coral-xyz/tamagui";
import { MaterialIcons } from "@expo/vector-icons";

import { MessageList } from "~components/Messages";
import { SearchInput } from "~components/StyledTextInput";
import { Screen } from "~components/index";
import { ChatStackNavigatorParamList } from "~screens/Unlocked/Chat/ChatHelpers";

import { useChatHelper, type ChatRowData } from "./ChatHelpers";

export function ChatListScreen({
  navigation,
}: StackScreenProps<ChatStackNavigatorParamList, "ChatList">): JSX.Element {
  const { allChats, requestCount, onRefreshChats, isRefreshingChats } =
    useChatHelper();

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
          iconBefore={<MaterialIcons size={24} color="blue" name="search" />}
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
