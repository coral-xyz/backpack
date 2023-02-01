import { useEffect } from "react";
import type { EnrichedMessage, SubscriptionType } from "@coral-xyz/common";
import { BACKEND_API_URL } from "@coral-xyz/common";
import { RecoilSync } from "@coral-xyz/db";
import { SignalingManager } from "@coral-xyz/react-common";
import {
  friendships,
  groupCollections,
  requestCount,
  roomChats,
  unreadCount,
  useUser,
} from "@coral-xyz/recoil";
import { useRecoilCallback, useRecoilState } from "recoil";

export const DbRecoilSync = () => {
  const { uuid } = useUser();
  const [_friendshipValue, setFriendshipsValue] = useRecoilState(
    friendships({ uuid })
  );
  const [_requestCountValue, setRequestCountValue] = useRecoilState(
    requestCount({ uuid })
  );
  const [_groupCollectionsValue, setGroupCollectionsValue] = useRecoilState(
    groupCollections({ uuid })
  );
  const [_unreadCount, setUnreadCount] = useRecoilState(unreadCount);
  const updateChats = useUpdateChats();

  const updateUnread = async () => {
    const response = await fetch(
      `${BACKEND_API_URL}/notifications/unreadCount`,
      {
        method: "GET",
      }
    );
    try {
      const json = await response.json();
      setUnreadCount(json.unreadCount || 0);
    } catch (e) {
      console.error(e);
    }
  };

  const getGroupedRooms = (
    chats: EnrichedMessage[]
  ): {
    room: string;
    type: SubscriptionType;
    messages: EnrichedMessage[];
  }[] => {
    const roomMap: { [key: string]: any } = {};
    chats.forEach((chat) => {
      const room: string = chat.room;
      if (!roomMap[room]) {
        roomMap[room] = {
          room: chat.room,
          type: chat.type,
          messages: [chat],
        };
      } else {
        roomMap[room]?.messages?.push(chat);
      }
    });
    return Object.keys(roomMap).map((roomId: string) => ({
      room: roomMap[roomId].room,
      type: roomMap[roomId].type,
      messages: roomMap[roomId].messages,
    }));
  };

  const sync = async (uuid: string) => {
    const activeChats = await RecoilSync.getInstance().getActiveChats(uuid);
    setFriendshipsValue(activeChats);
    const activeGroups = await RecoilSync.getInstance().getActiveGroups(uuid);
    setGroupCollectionsValue(activeGroups);
    const requestCount = await RecoilSync.getInstance().getRequestCount(uuid);
    setRequestCountValue(requestCount);
    const allMessages = await RecoilSync.getInstance().getAllChats(uuid);
    const groups = getGroupedRooms(allMessages);
    groups.forEach((group) => {
      updateChats({
        uuid,
        room: group.room,
        type: group.type,
        chats: group.messages,
      });
    });
    RecoilSync.getInstance().refreshUsersMetadata(uuid);
    updateUnread();
  };

  useEffect(() => {
    sync(uuid);
  }, [uuid]);

  useEffect(() => {
    SignalingManager.getInstance().onUpdateRecoil = async (
      props:
        | {
            type: "friendship";
          }
        | { type: "collection" }
        | {
            type: "chat";
            payload: {
              uuid: string;
              room: string;
              type: SubscriptionType;
              clear?: boolean;
              chats: EnrichedMessage[];
            };
          }
    ) => {
      switch (props.type) {
        case "friendship":
          const activeChats = await RecoilSync.getInstance().getActiveChats(
            uuid
          );
          setFriendshipsValue(activeChats);
          break;
        case "collection":
          const activeGroups = await RecoilSync.getInstance().getActiveGroups(
            uuid
          );
          setGroupCollectionsValue(activeGroups);
          break;
        case "chat":
          updateChats({
            uuid: props.payload.uuid,
            room: props.payload.room,
            type: props.payload.type,
            chats: props.payload.chats,
            clear: props.payload.clear,
          });
      }
    };
  }, []);

  return <></>;
};

export const useUpdateChats = () =>
  useRecoilCallback(
    ({ set, snapshot }: any) =>
      async ({
        uuid,
        room,
        type,
        chats,
        clear,
      }: {
        uuid: string;
        room: string;
        type: SubscriptionType;
        chats: EnrichedMessage[];
        clear?: boolean;
      }) => {
        const currentChats = snapshot.getLoadable(
          roomChats({ uuid, room, type })
        );
        const allChats = merge(clear ? [] : currentChats.valueMaybe(), chats);
        set(roomChats({ uuid, room, type }), allChats);
      }
  );

const merge = (
  originalChats: EnrichedMessage[] | undefined,
  updatedChats: EnrichedMessage[]
) => {
  if (!originalChats) {
    return updatedChats.sort((a, b) => (a.created_at < b.created_at ? -1 : 1));
  }
  const chatMapping: { [key: string]: EnrichedMessage } = {};
  originalChats.forEach(
    (chat) => (chatMapping[chat.client_generated_uuid] = chat)
  );
  updatedChats.forEach(
    (chat) => (chatMapping[chat.client_generated_uuid] = chat)
  );
  return Object.keys(chatMapping)
    .map((client_generated_uuid) => chatMapping[client_generated_uuid])
    .sort((a, b) => (a.created_at < b.created_at ? -1 : 1));
};
