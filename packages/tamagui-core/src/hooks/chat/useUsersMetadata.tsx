import { useEffect, useState } from "react";
import type { UserMetadata } from "@coral-xyz/common";
import { refreshUsers } from "@coral-xyz/db";
import { useUpdateUsers, useUser, useUserMetadataMap } from "@coral-xyz/recoil";

export function useUsersMetadata({
  remoteUserIds,
}: {
  remoteUserIds: string[];
}): { [key: string]: UserMetadata } {
  const { uuid } = useUser();
  const [existingUsers, setExistingUsers] = useState<string[]>([]);
  const usersMetadata = useUserMetadataMap({ remoteUserIds, uuid });
  const updateUsers = useUpdateUsers();

  const sync = async () => {
    const newIds = remoteUserIds.filter(
      (x) => !Object.keys(usersMetadata).includes(x)
    );
    if (newIds.length) {
      const newUsersMetadata = await refreshUsers(uuid, newIds);
      if (newUsersMetadata) {
        const newUsersMetadataMap = {};
        newUsersMetadata?.forEach((x) => (newUsersMetadataMap[x.uuid] = x));

        await updateUsers({ uuid, users: newUsersMetadataMap });
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

  return usersMetadata;
}
