import { BACKEND_API_URL } from "../constants";
import type { Blockchain } from "../types";

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

export const markSpam = async ({
  remoteUserId,
  spam,
}: {
  remoteUserId: string;
  spam: boolean;
}): Promise<any> => {
  return fetch(`${BACKEND_API_URL}/friends/spam`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ to: remoteUserId, spam }),
  });
};

// DEPRECATED NOT USED ANYWHERE PROBABLY CAN DELETE
export const searchUsersByBlockchain = async ({
  blockchain,
  address,
}: {
  blockchain: Blockchain;
  address: string;
}): Promise<any[]> => {
  // TODO(types)
  try {
    const params = [
      `usernamePrefix=${address}`,
      `blockchain=${blockchain}`,
      `limit=6`,
    ].join("&");

    const users = await fetch(`${BACKEND_API_URL}/users?${params}`).then((r) =>
      r.json()
    );

    return (users ?? []).sort((a: any, b: any) =>
      a.username.length < b.username.length ? -1 : 1
    );
  } catch (e) {
    console.error(e);
    return [];
  }
};
