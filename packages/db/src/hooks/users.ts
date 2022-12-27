import { SubscriptionType } from "@coral-xyz/common";
import { useLiveQuery } from "dexie-react-hooks";

import { getDb } from "../db";

export const useUsers = (uuid: string, uuids: string[]) => {
  const reqs = useLiveQuery(async () => {
    return getDb(uuid).users.bulkGet(uuids);
  });
  return reqs || [];
};
