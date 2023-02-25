import type { CollectionChatData, SubscriptionType } from "@coral-xyz/common";
import { useRecoilValue } from "recoil";

import {
  friendship,
  friendships,
  groupCollections,
  messageUnreadCount,
  requestCount,
  roomChats,
} from "../";

export function useFriendship({ userId }: { userId: string }): any {
  return useRecoilValue(friendship({ userId }));
}

export function useFriendships({ uuid }: { uuid: string }): any {
  return useRecoilValue(friendships({ uuid }));
}

export function useRequestsCount({ uuid }: { uuid: string }): any {
  return useRecoilValue(requestCount({ uuid }));
}

export function useGroupCollections({
  uuid,
}: {
  uuid: string;
}): CollectionChatData[] {
  return useRecoilValue(groupCollections({ uuid }));
}

export function useMessageUnreadCount({ uuid }: { uuid: string }): number {
  return useRecoilValue(messageUnreadCount({ uuid }));
}

export function useChats({
  uuid,
  room,
  type,
}: {
  uuid: string;
  room: string;
  type: SubscriptionType;
}): any {
  return useRecoilValue(roomChats({ uuid, room, type }));
}
