import type { MessageWithMetadata, SubscriptionType } from "@coral-xyz/common";
import { BACKEND_API_URL } from "@coral-xyz/common";
import { bulkAddChats, oldestReceivedMessage } from "@coral-xyz/db";

import { getAuthHeader } from "./getAuthHeader";
import { SignalingManager } from "./SignalingManager";

async function makeBackendApiRequest(
  endpoint: string,
  options: { jwt?: string; method?: string }
) {
  return fetch(`${BACKEND_API_URL}/${endpoint}`, {
    ...options,
    method: options.method || "GET",
    headers: {
      ...getAuthHeader(options.jwt),
    },
  }).then((res) => res.json());
}

export const fetchMoreChatsFor = async (
  uuid: string,
  room: string,
  type: SubscriptionType,
  nftMint?: string,
  publicKey?: string, // To avoid DB calls on the backend
  jwt?: string
) => {
  const oldestMessage = await oldestReceivedMessage(uuid, room, type);

  // If an old message exists, fetch everything before the date of that message
  // otherwise fetch messages since the current date
  const timestampBefore =
    oldestMessage?.created_at && !isNaN(parseInt(oldestMessage?.created_at))
      ? oldestMessage?.created_at
      : new Date().getTime();

  const params = [
    `room=${room}`,
    `type=${type}`,
    `limit=40`,
    `timestampBefore=${timestampBefore}`,
    `mint=${nftMint}`,
    `publicKey=${publicKey}`,
  ];

  const qs = params.join("&");
  try {
    const json = await makeBackendApiRequest(`chat?${qs}`, {
      method: "GET",
      jwt,
    });
    const chats: MessageWithMetadata[] = json.chats;

    SignalingManager.getInstance().onUpdateRecoil({
      type: "chat",
      payload: {
        uuid,
        room,
        type,
        chats: chats.map((chat) => ({
          ...chat,
          direction: uuid === chat.uuid ? "send" : "recv",
          received: true,
          from_http_server: 1,
        })),
      },
    });

    await bulkAddChats(
      uuid,
      chats.map((chat) => ({
        ...chat,
        direction: uuid === chat.uuid ? "send" : "recv",
        received: true,
        from_http_server: 1,
      }))
    );
  } catch (e) {
    console.log("Error found :(");
    console.log(JSON.stringify(e));
  }
};
