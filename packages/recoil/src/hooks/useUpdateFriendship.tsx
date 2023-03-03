import { fetchFriendship } from "@coral-xyz/common";
import { useRecoilCallback } from "recoil";

import { friendship } from "../atoms";

export const useUpdateFriendships = () =>
  useRecoilCallback(
    ({ set, snapshot }: any) =>
      async ({
        friendshipValue,
        userId,
      }: {
        friendshipValue: any;
        userId: string;
      }) => {
        const currentFriendship = snapshot.getLoadable(friendship({ userId }));
        let existingFriendship = currentFriendship.valueMaybe();
        if (!existingFriendship || !existingFriendship.id) {
          const json = await fetchFriendship({ userId });
          existingFriendship = {
            id: json.friendshipId,
            areFriends: json.areFriends,
            blocked: json.blocked,
            requested: json.requested,
            spam: json.spam,
            remoteRequested: json.remoteRequested,
          };
        }
        set(friendship({ userId }), {
          ...(existingFriendship || {}),
          ...friendshipValue,
        });
      }
  );
