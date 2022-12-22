import { getDb } from "./index";

export const updateFriendship = (
  uuid: string,
  remoteUserId,
  updatedProps: {
    blocked?: boolean;
    spam?: boolean;
    areFriends?: boolean;
  }
) => {
  return getDb(uuid).inbox.update(remoteUserId, updatedProps);
};
