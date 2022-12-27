import type { EnrichedMessage } from "@coral-xyz/common";

import { getDb } from "./index";

export const latestReceivedMessage = async (
  uuid: string,
  roomId: string,
  type: string
) => {
  return (
    await getDb(uuid)
      .messages.where({ room: roomId, type: type, from_http_server: true })
      .limit(1)
      .reverse()
      .sortBy("created_at")
  )[0];
};

export const bulkAddChats = (uuid: string, chats: EnrichedMessage[]) => {
  getDb(uuid).messages.bulkAdd(chats);
};

export const clearChats = (uuid: string, room: string, type: string) => {
  return getDb(uuid).messages.where({ room }).delete();
};
