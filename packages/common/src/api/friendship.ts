import { BACKEND_API_URL } from "../constants";

export const sendFriendRequest = async ({
  sendRequest,
  to,
}: {
  sendRequest: boolean;
  to: string;
}) => {
  await fetch(`${BACKEND_API_URL}/friends/request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ to, sendRequest }),
  });
};

export const unFriend = async ({ to }: { to: string }) => {
  await fetch(`${BACKEND_API_URL}/friends/unfriend`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ to }),
  });
};

export const fetchFriendship = async ({ userId }: { userId: string }) => {
  const res = await fetch(`${BACKEND_API_URL}/inbox`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to: userId }),
  });
  const json = await res.json();
  return json;
};
