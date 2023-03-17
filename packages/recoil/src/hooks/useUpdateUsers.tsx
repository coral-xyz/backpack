import type { UserMetadata } from "@coral-xyz/common";
import { useRecoilCallback } from "recoil";

import { remoteUsersMetadataMap } from "../atoms";

export const useUpdateUsers = () =>
  useRecoilCallback(
    ({ set, snapshot }: any) =>
      async ({
        uuid,
        users,
      }: {
        uuid: string;
        users: { [key: string]: UserMetadata };
      }) => {
        const currentChats = snapshot.getLoadable(
          remoteUsersMetadataMap({ uuid })
        );
        const updatedData = {
          ...currentChats.valueMaybe(),
          ...users,
        };
        set(remoteUsersMetadataMap({ uuid }), updatedData);
      }
  );
