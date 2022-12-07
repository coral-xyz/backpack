import type { Friendship } from "@coral-xyz/common";
import { BACKEND_API_URL } from "@coral-xyz/common";
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
          };
        } catch (e) {
          return null;
        }
      },
  }),
});
