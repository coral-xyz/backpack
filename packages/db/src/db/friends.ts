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
    interacted?: 0 | 1;
    remoteInteracted?: 0 | 1;
  }
) => {
  return getDb(uuid).inbox.update(remoteUserId, updatedProps);
};

export const createDefaultFriendship = (
  uuid: string,
  remoteUserId: string,
  props: {
    last_message_sender?: string;
    last_message_timestamp?: string;
    last_message?: string;
    last_message_client_uuid?: string;
  },
  dbProps: {
    interacted?: 0 | 1;
    remoteInteracted?: 0 | 1;
  }
) => {
  //@ts-ignore (object created partially, full object comes from server on refresh)
  return getDb(uuid).inbox.put({
    ...props,
    remoteUserId,
    spam: 0,
    blocked: 0,
    unread: 0,
    are_friends: false,
    areFriends: 0,
    remoteInteracted: dbProps.remoteInteracted ? 1 : 0,
    interacted: dbProps.interacted ? 1 : 0,
  });
};

export const getFriendshipByRoom = async (uuid: string, room: number) => {
  return (await getDb(uuid).inbox.where({ id: room }).limit(1).toArray())[0];
};

export const getFriendshipByUserId = async (
  uuid: string,
  remoteUserId: string
) => {
  return (
    await getDb(uuid).inbox.where({ remoteUserId }).limit(1).toArray()
  )[0];
};

export const updateFriendshipIfExists = async (
  uuid: string,
  remoteUserId: string,
  updatedProps: {
    areFriends?: 0 | 1;
    requested?: 0 | 1;
    remoteRequested?: 0 | 1;
  }
) => {
  const friendship = await getFriendshipByUserId(uuid, remoteUserId);
  if (friendship) {
    await getDb(uuid).inbox.update(remoteUserId, updatedProps);
    if (
      updatedProps.areFriends === 0 &&
      !friendship.remoteInteracted &&
      !friendship.interacted
    ) {
      // If you unfriend someone you haven't ever interacted with,
      // we remove them from the in memory DB
      await getDb(uuid).inbox.delete(friendship.remoteUserId);
    }
  }
};
