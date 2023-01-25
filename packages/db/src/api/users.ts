import { BACKEND_API_URL, getRandomColor } from "@coral-xyz/common";

import { bulkAddUsers, getNewUsers } from "../db/users";

export const refreshUsers = async (uuid: string, uniqueUserIds: string[]) => {
  const newUsers = await getNewUsers(uuid, uniqueUserIds);
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
        })) || [];
      bulkAddUsers(uuid, newUsersMetadata);
      return newUsersMetadata;
    } catch (e) {
      console.log(e);
    }
  }
};
