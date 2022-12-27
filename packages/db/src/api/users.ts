import { BACKEND_API_URL } from "@coral-xyz/common";

import { bulkAddUsers, getNewUsers } from "../db/users";

export const refreshUsers = async (uuid: string, uniqueUserIds: string[]) => {
  const newUsers = await getNewUsers(uuid, uniqueUserIds);
  if (newUsers.length) {
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
    bulkAddUsers(uuid, json.users || []);
  }
};
