import { useEffect } from "react";
import type { EnrichedMessage, SubscriptionType } from "@coral-xyz/common";
import { RecoilSync } from "@coral-xyz/db";
import {
  friendships,
  groupCollections,
  remoteUsersMetadata,
  requestCount,
  roomChats,
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
  const updateChats = useUpdateChats();

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
  };

  useEffect(() => {
    sync(uuid);
  }, [uuid]);

  return <></>;
};

export const useUpdateChats = () =>
  useRecoilCallback(
    ({ set }: any) =>
      async ({
        uuid,
        room,
        type,
        chats,
      }: {
        uuid: string;
        room: string;
        type: SubscriptionType;
        chats: EnrichedMessage[];
      }) => {
        set(roomChats({ uuid, room, type }), chats);
      }
  );

export const useUpdateRemoteUserMetadata = () =>
  useRecoilCallback(
    ({ set }: any) =>
      async ({
        uuid,
        remoteUserId,
      }: {
        uuid: string;
        remoteUserId: string;
        usermetadata: {};
      }) => {
        set(remoteUsersMetadata({ uuid, remoteUserId }));
      }
  );
