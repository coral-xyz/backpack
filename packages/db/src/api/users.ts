import { BACKEND_API_URL } from "@coral-xyz/common";

import { bulkAddUsers, getNewUsers } from "../db/users";

const COLORS = [
  "#1abc9c",
  "#2ecc71",
  "#3498db",
  "#9b59b6",
  "#34495e",
  "#16a085",
  "#27ae60",
  "#8e44ad",
  "#2c3e50",
  "#e74c3c",
  "#c0392b",
  "#d35400",
  "#c0392b",
];

const getRandomColor = () => {
  return COLORS[Math.floor(COLORS.length * Math.random())];
};

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
    bulkAddUsers(
      uuid,
      json.users.map((user) => ({
        ...user,
        color: getRandomColor(),
      })) || []
    );
  }
};
