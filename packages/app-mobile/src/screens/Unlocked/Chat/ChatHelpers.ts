import type {
  SubscriptionType,
  CollectionChatData,
  EnrichedInboxDb,
} from "@coral-xyz/common";

import { useMemo } from "react";

import { useUsersMetadata } from "@coral-xyz/chat-xplat";
import { parseMessage } from "@coral-xyz/common";
import {
  useFriendships,
  useGroupCollections,
  useRequestsCount,
  useUser,
} from "@coral-xyz/recoil";

type ChatType =
  | { chatType: "individual"; chatProps: EnrichedInboxDb }
  | { chatType: "collection"; chatProps: CollectionChatData };

type ParsedChatType = {
  type: SubscriptionType;
  id: string;
  image: string;
  userId: string;
  name: string;
  message: string;
  timestamp: string;
  isUnread: boolean;
};

export type ChatRowData = {
  roomId: string;
  roomType: SubscriptionType;
  roomName: string;
  remoteUserId?: string;
  remoteUsername?: string;
};

export type ChatListItemProps = {
  type: SubscriptionType;
  image: string;
  name: string;
  message: string;
  timestamp: string;
  id: string;
  isUnread: boolean;
  userId: string;
  onPress: (chatData: ChatRowData) => void;
};

function parseChats(allChats: ChatType[]): ParsedChatType[] {
  return allChats.map((activeChat) => {
    return {
      type: activeChat.chatType,
      id:
        activeChat.chatType === "individual"
          ? activeChat.chatProps.friendshipId
          : activeChat.chatProps.collectionId,
      image:
        activeChat.chatType === "individual"
          ? activeChat.chatProps.remoteUserImage!
          : activeChat.chatProps.image!,
      userId:
        activeChat.chatType === "individual"
          ? activeChat.chatProps.remoteUserId!
          : "",
      name:
        activeChat.chatType === "individual"
          ? activeChat.chatProps.remoteUsername!
          : activeChat.chatProps.name!,
      message:
        activeChat.chatType === "individual"
          ? activeChat.chatProps.last_message!
          : activeChat.chatProps.lastMessage!,
      timestamp:
        activeChat.chatType === "individual"
          ? activeChat.chatProps.last_message_timestamp || ""
          : activeChat.chatProps.lastMessageTimestamp || "",
      isUnread:
        activeChat.chatType === "individual"
          ? !!activeChat.chatProps.unread
          : activeChat.chatProps.lastMessageUuid !==
            activeChat.chatProps.lastReadMessage,
    };
  });
}

const getAllChatStuff = ({
  activeChats,
  groupCollections,
}: {
  activeChats: any[];
  groupCollections: any[];
}): ParsedChatType[] => {
  const getDefaultChats = () => {
    return groupCollections.filter((x) => x.name && x.image) || [];
  };

  const allChats: ChatType[] = [
    ...getDefaultChats().map((x) => ({
      chatProps: x,
      chatType: "collection" as SubscriptionType,
    })),
    ...(activeChats || []).map((x) => ({
      chatProps: x,
      chatType: "individual" as SubscriptionType,
    })),
  ].sort((a, b) =>
    // @ts-ignore
    (a.chatType === "individual"
      ? new Date(a.chatProps.last_message_timestamp).getTime()
      : new Date(a.chatProps.lastMessageTimestamp)) <
    (b.chatType === "individual"
      ? new Date(b.chatProps.last_message_timestamp).getTime()
      : new Date(b.chatProps.lastMessageTimestamp).getTime())
      ? 1
      : -1
  );

  return parseChats(allChats);
};

export function useChatHelper() {
  const user = useUser();
  const activeChats = useFriendships({ uuid: user.uuid });
  const requestCount = useRequestsCount({ uuid: user.uuid });
  const groupCollections = useGroupCollections({ uuid: user.uuid });

  const allChats = useMemo(() => {
    return getAllChatStuff({ activeChats, groupCollections });
  }, [activeChats, groupCollections]);

  return {
    allChats,
    requestCount,
    onRefreshChats: () => {},
    isRefreshingChats: false,
  };
}

export function useMessagePreview(message: string | null): string {
  const parts = parseMessage(message || "");
  const users: any = useUsersMetadata({
    remoteUserIds: parts.filter((x) => x.type === "tag").map((x) => x.value),
  });
  const printText = parts
    .map((x) => (x.type === "tag" ? users[x.value]?.username : x.value))
    .join("");

  let messagePreview = "";
  if (printText) {
    messagePreview =
      printText.length > 25 ? printText.substring(0, 22) + "..." : printText;
  }

  return messagePreview;
}
