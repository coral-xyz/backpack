import type { StackScreenProps } from "@react-navigation/stack";

import { MessageList } from "~components/Messages";
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
    <MessageList
      requestCount={requestCount}
      allChats={allChats}
      onPressRow={handlePressMessage}
      onPressRequest={handlePressRequest}
      onRefreshChats={onRefreshChats}
      isRefreshing={isRefreshingChats}
    />
  );
}
