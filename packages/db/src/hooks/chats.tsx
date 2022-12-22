import { useLiveQuery } from "dexie-react-hooks";

import { getDb } from "../db";

export const useActiveChats = (uuid: string) => {
  const activeChats = useLiveQuery(async () => {
    return getDb(uuid).inbox.where({ blocked: 0, interacted: 1 }).toArray();
  });

  return activeChats;
};

export const useRequestsCount = (uuid: string) => {
  const count = useLiveQuery(async () => {
    return getDb(uuid).inbox.where({ are_friends: 0, interacted: 0 }).count();
  });

  return count;
};

export const useRequests = (uuid: string) => {
  const reqs = useLiveQuery(async () => {
    return getDb(uuid).inbox.where({ areFriends: 0, interacted: 0 }).toArray();
  });

  return reqs;
};
