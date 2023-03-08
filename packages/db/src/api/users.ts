import {
  BACKEND_API_URL,
  getRandomColor,
  getRandomColorIndex,
} from "@coral-xyz/common";

import { bulkAddUsers, getNewUsers } from "../db/users";

export const refreshUsers = async (
  uuid: string,
  uniqueUserIds: string[],
  force?: boolean
) => {
  const newUsers = force
    ? uniqueUserIds
    : await getNewUsers(uuid, uniqueUserIds);
  if (newUsers.length) {
    try {
      const response = await fetch(`${BACKEND_API_URL}/users/metadata`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uuids: uniqueUserIds,
        }),
      });
      const json = await response.json();
      const newUsersMetadata =
        json.users.map((user) => ({
          ...user,
          color: getRandomColor(),
          colorIndex: getRandomColorIndex(),
        })) || [];
      bulkAddUsers(uuid, newUsersMetadata);
      return newUsersMetadata;
    } catch (e) {
      console.log(e);
    }
  }
};
