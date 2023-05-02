import type {
  CollectionChatData,
  EnrichedMessage,
  MessageUpdates,
} from "@coral-xyz/common";
import { DELETE_MESSAGE } from "@coral-xyz/common";

import { getDb } from "./index";

export const latestReceivedUpdate = async (
  uuid: string,
  roomId: string,
  type: string
) => {
  return getDb(uuid).updates.get(roomId);
};

export const resetUpdateTimestamp = async (uuid: string, roomId: string) => {
  await getDb(uuid).updates.put({
    last_local_reset_time: new Date().getTime(),
    last_received_update_id: 0, // doesn't matter since we've updated the time to be the latest
    room: roomId,
  });
};

export const latestReceivedMessage = async (
  uuid: string,
  roomId: string,
  type: string
) => {
  return (
    await getDb(uuid)
      .messages.where({ room: roomId, type: type, from_http_server: 1 })
      .reverse()
      .sortBy("created_at")
  )[0];
};

export const oldestReceivedMessage = async (
  uuid: string,
  roomId: string,
  type: string
) => {
  return (
    await getDb(uuid)
      .messages.where({ room: roomId, type: type, from_http_server: 1 })
      .sortBy("created_at")
  )[0];
};

export const processMessageUpdates = async (
  uuid: string,
  updates: MessageUpdates[]
): Promise<EnrichedMessage[]> => {
  const result = await Promise.all(
    updates
      .filter((x) => x.type === DELETE_MESSAGE)
      .map((update) => deleteChat(uuid, update.client_generated_uuid))
  );

  const latestUpdate = updates.sort((a, b) => (a.id > b.id ? -1 : 1))?.[0];
  if (latestUpdate) {
    await getDb(uuid).updates.put({
      last_local_reset_time: new Date().getTime(),
      last_received_update_id: latestUpdate.id,
      room: latestUpdate.room,
    });
  }

  //@ts-ignore
  return result.filter((x) => x !== null);
};

export const deleteChat = async (
  uuid: string,
  clientGeneratedUuid: string
): Promise<EnrichedMessage | null> => {
  const db = getDb(uuid);
  const el = await db.messages.get(clientGeneratedUuid);

  if (el) {
    await db.messages.update(clientGeneratedUuid, {
      deleted: true,
      message: "",
      message_metadata: {},
    });
    //@ts-ignore
    return {
      ...(await db.messages.get(clientGeneratedUuid)),
      deleted: true,
    } as EnrichedMessage;
  } else {
    return null;
  }
};

export const bulkAddChats = (uuid: string, chats: EnrichedMessage[]) => {
  return getDb(uuid).messages.bulkPut(chats);
};

export const clearChats = (uuid: string, room: string, type: string) => {
  return getDb(uuid).messages.where({ room }).delete();
};

export const createOrUpdateCollection = async (
  uuid: string,
  data: CollectionChatData
) => {
  const db = getDb(uuid);
  if (await db.collections.get(data.collectionId)) {
    return db.collections.update(data.collectionId, data);
  } else {
    return db.collections.put(data);
  }
};
