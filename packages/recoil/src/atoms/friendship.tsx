import type { CollectionChatData,Friendship  } from "@coral-xyz/common";
import { BACKEND_API_URL } from "@coral-xyz/common";
import type { EnrichedInboxDb } from "@coral-xyz/common/dist/esm/messages/db";
import { atomFamily, selectorFamily } from "recoil";

export const friendship = atomFamily<Friendship | null, { userId: string }>({
  key: "friendship",
  default: selectorFamily({
    key: "friendshipDefault",
    get:
      ({ userId }: { userId: string }) =>
      async ({ get }: any) => {
        if (!userId) {
          return null;
        }
        try {
          const res = await fetch(`${BACKEND_API_URL}/inbox`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ to: userId }),
          });
          const json = await res.json();
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
