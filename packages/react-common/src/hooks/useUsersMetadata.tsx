import { useEffect, useState } from "react";
import type { UserMetadata } from "@coral-xyz/common";
import { getBulkUsers, refreshUsers } from "@coral-xyz/db";
import { useUser } from "@coral-xyz/recoil";

export function useUsersMetadata({
  remoteUserIds,
}: {
  remoteUserIds: string[];
}): { [key: string]: UserMetadata } {
  const { uuid } = useUser();
  const [users, setUsers] = useState<{ [key: string]: UserMetadata }>({});
  const [existingUsers, setExistingUsers] = useState<string[]>([]);

  const sync = async () => {
    const usersMetadata = await getBulkUsers(uuid, remoteUserIds);
    const usersMetadataMap = {};
    usersMetadata.forEach((x) => {
      if (x) {
        usersMetadataMap[x.uuid] = x;
      }
    });
    setUsers(usersMetadataMap || {});

    const newIds = remoteUserIds.filter(
      (x) => !usersMetadata.map((x) => x?.uuid).includes(x)
    );
    if (newIds.length) {
      const newUsersMetadata = await refreshUsers(uuid, newIds);
      if (newUsersMetadata) {
        const newUsersMetadataMap = {};
        newUsersMetadata?.forEach((x) => (newUsersMetadataMap[x.uuid] = x));
        setUsers({ ...usersMetadataMap, ...newUsersMetadataMap });
      }
    }
  };

  useEffect(() => {
    if (JSON.stringify(remoteUserIds) === JSON.stringify(existingUsers)) {
      return;
    }
    setExistingUsers(remoteUserIds);
    sync();
  }, [remoteUserIds, existingUsers]);

  return users;
}
