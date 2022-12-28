import { getDb } from "./index";

export const updateFriendship = (
  uuid: string,
  remoteUserId,
  updatedProps: {
    blocked?: 0 | 1;
    spam?: 0 | 1;
    areFriends?: 0 | 1;
    last_message_sender?: string;
    last_message_timestamp?: string;
    last_message?: string;
    unread?: 0 | 1;
  }
) => {
  return getDb(uuid).inbox.update(remoteUserId, updatedProps);
};

export const getFriendshipByRoom = async (uuid: string, room: number) => {
  return (await getDb(uuid).inbox.where({ id: room }).limit(1).toArray())[0];
};
