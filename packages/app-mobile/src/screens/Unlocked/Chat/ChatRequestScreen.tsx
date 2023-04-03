import type { StackScreenProps } from "@react-navigation/stack";

import { useRequests } from "@coral-xyz/db";
import { useUser } from "@coral-xyz/recoil";
import { Text } from "@coral-xyz/tamagui";

import { MessageList } from "~components/Messages";
import { Screen } from "~components/index";
import { useTheme } from "~hooks/useTheme";
import { ChatStackNavigatorParamList } from "~screens/Unlocked/Chat/ChatHelpers";

export function ChatRequestScreen({
  navigation,
}: StackScreenProps<ChatStackNavigatorParamList, "ChatRequest">): JSX.Element {
  const theme = useTheme();
  const { uuid } = useUser();
  // TODO(kirat) causes errors
  const activeChats = useRequests(uuid) || [];
  return (
    <Screen>
      <Text
        fontFamily="Inter"
        fontWeight="500"
        fontSize={16}
        color={theme.custom.colors.smallTextColor}
        textAlign="center"
      >
        These are not from your friends. Click into a message to reply or view
        their profile.
      </Text>
      <MessageList
        requestCount={0}
        allChats={[]}
        onPressRow={console.log}
        onPressRequest={() => {}}
        onRefreshChats={() => {}}
        isRefreshing={false}
      />
    </Screen>
  );
}

export function ChatRequestDetailScreen({
  navigation,
}: StackScreenProps<
  ChatStackNavigatorParamList,
  "ChatRequestDetail"
>): JSX.Element {
  const theme = useTheme();
  return (
    <Screen>
      <Text
        fontFamily="Inter"
        fontWeight="500"
        fontSize={16}
        color={theme.custom.colors.smallTextColor}
        textAlign="center"
      >
        These are not from your friends. Click into a message to reply or view
        their profile.
      </Text>
      <MessageList
        requestCount={0}
        allChats={[]}
        onPressRow={console.log}
        onPressRequest={() => {}}
        onRefreshChats={() => {}}
        isRefreshing={false}
      />
    </Screen>
  );
}
