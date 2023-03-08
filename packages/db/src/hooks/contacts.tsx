import type { EnrichedInboxDb } from "@coral-xyz/common";
import { useLiveQuery } from "dexie-react-hooks";

import { getDb } from "../db";

import { useUsers } from "./users";

export const useContacts = (uuid: string): EnrichedInboxDb[] => {
  const activeChats = useLiveQuery(async () => {
    return getDb(uuid).inbox.where({ areFriends: 1 }).toArray();
  });

  return (
    activeChats?.map((chat) => ({
      ...chat,
    })) || []
  );
};
