import { Suspense, useEffect } from "react";
import type {
  EnrichedMessage,
  EnrichedNotification,
  SubscriptionType,
  UserMetadata,
} from "@coral-xyz/common";
import { BACKEND_API_URL } from "@coral-xyz/common";
import { RecoilSync } from "@coral-xyz/db";
import {
  friendships,
  groupCollections,
  recentNotifications,
  requestCount,
  roomChats,
  unreadCount,
  useAuthenticatedUser,
  useRecentNotifications,
  useUpdateUsers,
} from "@coral-xyz/recoil";
import { useRecoilCallback, useSetRecoilState } from "recoil";

import { getAuthHeader } from "./getAuthHeader";
import {
  BackgroundChatsSync,
  refreshGroupsAndFriendships,
  SignalingManager,
} from "./";

// Wrapper compoennt to ensure syncing only happens when there is an
// authenticated user
export const AuthenticatedSync = () => {
  const authenticatedUser = useAuthenticatedUser();

  if (authenticatedUser) {
    return (
      <>
        <ChatSync uuid={authenticatedUser.uuid} jwt={authenticatedUser.jwt} />
        <DbRecoilSync uuid={authenticatedUser.uuid} />
      </>
    );
  }

  return null;
};

export const ChatSync = ({ uuid, jwt }: { uuid: string; jwt: string }) => {
  useEffect(() => {
    (async () => {
      await Promise.all([
        refreshGroupsAndFriendships(uuid, jwt).then(
          async () => await BackgroundChatsSync.getInstance().updateUuid(uuid)
        ),
        SignalingManager.getInstance().updateUuid(uuid, jwt),
      ]);
    })();
  }, [uuid, jwt]);

  return null;
};

export const DbRecoilSync = ({ uuid }: { uuid: string }) => {
  const updateChats = useUpdateChats();
  const updateNotifications = useUpdateNotifications();
  const updateUsers = useUpdateUsers();
  const authenticatedUser = useAuthenticatedUser();

  const setFriendshipsValue = useSetRecoilState(friendships({ uuid }));
  const setRequestCountValue = useSetRecoilState(requestCount({ uuid }));
  const setGroupCollectionsValue = useSetRecoilState(
    groupCollections({ uuid })
  );
  const setUnreadCount = useSetRecoilState(unreadCount);
  // initialize the recoil store with 50 notifications from the server

  const updateUnread = async () => {
    const response = await fetch(
      `${BACKEND_API_URL}/notifications/unreadCount`,
      {
        method: "GET",
        headers: {
          ...getAuthHeader(authenticatedUser?.jwt),
        },
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

    const users = await RecoilSync.getInstance().getAllUsers(uuid);
    const usersMap = {};
    users.forEach((user) => (usersMap[user.uuid] = user));
    updateUsers({ users: usersMap, uuid });

    RecoilSync.getInstance().refreshUsersMetadata(uuid);
    updateUnread();
  };

  useEffect(() => {
    (async () => {
      await sync(uuid);
    })();
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
        | {
            type: "add-notifications";
            payload: {
              id: number;
              title: string;
              body: string;
              xnft_id: string;
              timestamp: string;
              uuid: string;
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
          break;
        case "add-notifications":
          setUnreadCount((x) => x + 1);
          updateNotifications({
            uuid: props.payload.uuid,
            notificationPayload: props.payload,
          });
      }
    };
  }, [uuid]);

  return (
    <Suspense fallback={null}>
      <NotificationsWrapper uuid={uuid} />
    </Suspense>
  );
};

function NotificationsWrapper({ uuid }: { uuid: string }) {
  const _notifications: EnrichedNotification[] = useRecentNotifications({
    limit: 50,
    offset: 0,
    uuid: uuid,
  });
  return null;
}

export const useUpdateNotifications = () =>
  useRecoilCallback(
    ({ set, snapshot }: any) =>
      async ({
        uuid,
        notificationPayload,
      }: {
        uuid: string;
        notificationPayload: {
          id: number;
          title: string;
          body: string;
          xnft_id: string;
          timestamp: string;
          uuid: string;
        };
      }) => {
        const currentNotifications = snapshot.getLoadable(
          recentNotifications({
            limit: 50,
            offset: 0,
            uuid: uuid,
          })
        );
        set(recentNotifications({ limit: 50, offset: 0, uuid: uuid }), [
          {
            ...notificationPayload,
            timestamp: new Date(notificationPayload.timestamp).getTime(),
          },
          ...(currentNotifications.valueMaybe() ?? []),
        ]);
      }
  );

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
