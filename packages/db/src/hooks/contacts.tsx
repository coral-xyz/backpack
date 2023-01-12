import { useLiveQuery } from "dexie-react-hooks";

import { getDb } from "../db";

import { useUsers } from "./users";

export const useContacts = (uuid: string) => {
  const activeChats = useLiveQuery(async () => {
    return getDb(uuid).inbox.where({ areFriends: 1 }).toArray();
  });
  const users = useUsers(uuid, activeChats || []);

  return (
    activeChats?.map((chat) => ({
      ...chat,
      remoteUserImage:
        users?.find((x) => x?.uuid === chat.remoteUserId)?.image || "",
    })) || []
  );
};
