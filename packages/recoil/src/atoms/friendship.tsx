import type {
  CollectionChatData,
  EnrichedMessage,
  Friendship,
  SubscriptionType,
  UserMetadata,
} from "@coral-xyz/common";
import { Blockchain, fetchFriendship } from "@coral-xyz/common";
import type { EnrichedInboxDb } from "@coral-xyz/common/dist/esm/messages/db";
import { getFriendshipByUserId } from "@coral-xyz/db";
import { atomFamily, selectorFamily } from "recoil";

import * as atoms from "./preferences/index";

export const friendship = atomFamily<Friendship | null, { userId: string }>({
  key: "friendship",
  default: selectorFamily({
    key: "friendshipDefault",
    get:
      ({ userId }: { userId: string }) =>
      async ({ get }: any) => {
        const localUser = get(atoms.user);
        if (!userId || !localUser.uuid) {
          return null;
        }
        const friendship = await getFriendshipByUserId(localUser.uuid, userId);
        if (friendship && friendship.friendshipId) {
          return {
            id: friendship.friendshipId,
            areFriends: friendship.areFriends === 1 ? true : false,
            blocked: friendship.blocked === 1 ? true : false,
            requested: friendship.requested === 1 ? true : false,
            spam: friendship.spam === 1 ? true : false,
            remoteRequested: friendship.remoteRequested === 1 ? true : false,
          };
        }
        try {
          const json = await fetchFriendship({ userId });
          return {
            id: json.friendshipId,
            areFriends: json.areFriends,
            blocked: json.blocked,
            requested: json.requested,
            spam: json.spam,
            remoteRequested: json.remoteRequested,
          };
        } catch (e) {
          return null;
        }
      },
  }),
});

export const friendships = atomFamily<
  EnrichedInboxDb[] | null | undefined,
  { uuid: string }
>({
  key: "friendships",
  default: selectorFamily({
    key: "friendshipsDefault",
    get:
      ({ uuid }: { uuid: string }) =>
      async ({ get }: any) => {
        return [];
      },
  }),
});

export const messageUnreadCount = atomFamily<number, { uuid: string }>({
  key: "messageUnreadCount",
  default: selectorFamily({
    get:
      ({ uuid }: { uuid: string }) =>
      async ({ get }: any) => {
        const activeChats = get(friendships({ uuid }));
        const groupChats = get(groupCollections({ uuid }));
        return (
          (activeChats.filter((x) => (x.unread ? true : false))?.length || 0) +
          (groupChats
            .filter((x) => x.lastMessageUuid !== x.lastReadMessage)
            .filter((x) => x.name && x.image).length || 0)
        );
      },
    key: "messageUnreadCountDefault",
  }),
});

export const roomChats = atomFamily<
  EnrichedMessage[] | null | undefined,
  { uuid: string; room: string; type: SubscriptionType }
>({
  key: "chats",
  default: selectorFamily({
    key: "chatsDefault",
    get:
      ({
        uuid,
        room,
        type,
      }: {
        uuid: string;
        room: string;
        type: SubscriptionType;
      }) =>
      async ({ get }: any) => {
        return [];
      },
  }),
});

export const requestCount = atomFamily<number, { uuid: string }>({
  key: "requestCount",
  default: selectorFamily({
    key: "requestCountDefault",
    get:
      ({ uuid }: { uuid: string }) =>
      async ({ get }: any) => {
        return 0;
      },
  }),
});

export const groupCollections = atomFamily<
  CollectionChatData[],
  { uuid: string }
>({
  key: "groupCollections",
  default: selectorFamily({
    key: "groupCollectionsDefault",
    get:
      ({ uuid }: { uuid: string }) =>
      async ({ get }: any) => {
        return [];
      },
  }),
});

export const remoteUsersMetadata = atomFamily<
  {
    username: string;
    image: string;
    color: string;
    loading: boolean;
    colorIndex: number;
  },
  { uuid: string; remoteUserId: string }
>({
  key: "remoteUsersMetadata",
  default: selectorFamily({
    key: "remoteUsersMetadataDefault",
    get:
      ({ uuid, remoteUserId }: { uuid: string; remoteUserId: string }) =>
      async ({ get }: any) => {
        return {
          username: "",
          image: "",
          loading: false,
          color: "",
          colorIndex: 0,
        };
      },
  }),
});

export const remoteUsersMetadataMap = atomFamily<
  {
    [key: string]: UserMetadata;
  },
  { uuid: string }
>({
  key: "remoteUsersMetadataMap",
  default: selectorFamily({
    key: "remoteUsersMetadataMapDefault",
    get:
      ({ uuid }: { uuid: string; remoteUserId: string }) =>
      async ({ get }: any) => {
        return {};
      },
  }),
});

export const remoteUsersMetadataSelector = selectorFamily<
  {
    [key: string]: UserMetadata;
  },
  { remoteUserIds: string[]; uuid: string }
>({
  key: "remoteUsersMetadataSelector",
  get:
    ({ uuid, remoteUserIds }) =>
    ({ get }) => {
      const remoteUsersMetadata = get(remoteUsersMetadataMap({ uuid }));
      const returnMap: {
        [key: string]: UserMetadata;
      } = {};
      Object.keys(remoteUsersMetadata)
        .filter((x) => remoteUserIds.includes(x))
        .forEach((x) => (returnMap[x] = remoteUsersMetadata[x]));
      return returnMap;
    },
});
