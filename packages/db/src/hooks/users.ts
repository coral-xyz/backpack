import { EnrichedMessageWithMetadata } from "@coral-xyz/common";
import { useLiveQuery } from "dexie-react-hooks";

import { getDb } from "../db";

export const useUsers = (uuid: string, chats: any[]) => {
  const reqs = useLiveQuery(async () => {
    const userUuids = chats?.map((chat) => chat.uuid) || [];
    const uniqueUserUuids = userUuids.filter(
      (x, index) => userUuids.indexOf(x) === index
    );
    return getDb(uuid).users.bulkGet(uniqueUserUuids);
  }, [chats]);

  return reqs || [];
};
