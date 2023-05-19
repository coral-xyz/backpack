import { useEffect, useState } from "react";
import {
  BACKEND_API_URL,
  getRandomColor,
  getRandomColorIndex,
} from "@coral-xyz/common";
import { bulkAddUsers, getBulkUsers, refreshUsers } from "@coral-xyz/db";
import { remoteUsersMetadata, useUser } from "@coral-xyz/recoil";
import { useRecoilState } from "recoil";

export function useUserMetadata({ remoteUserId }: { remoteUserId: string }) {
  const { uuid } = useUser();
  const [userMetadata, setUserMetadata] = useRecoilState(
    remoteUsersMetadata({ remoteUserId, uuid })
  );

  const refreshUserMetadata = async () => {
    try {
      const response = await fetch(`${BACKEND_API_URL}/users/metadata`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uuids: [remoteUserId],
        }),
      });
      const json = await response.json();
      const color = getRandomColor();
      const colorIndex = getRandomColorIndex();

      setUserMetadata({
        username: json.users[0].username,
        image: json.users[0].image,
        loading: false,
        color,
        colorIndex,
      });

      bulkAddUsers(uuid, [
        {
          uuid: remoteUserId,
          username: json.users[0].username,
          image: json.users[0].image,
          color,
          colorIndex,
        },
      ]);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (remoteUserId && !userMetadata.username) {
      refreshUserMetadata();
    }
  }, [userMetadata, remoteUserId]);

  return userMetadata;
}
