import { useRecoilValue } from "recoil";

import { remoteUsersMetadataSelector } from "../atoms";

export function useUserMetadataMap({
  remoteUserIds,
  uuid,
}: {
  remoteUserIds: string[];
  uuid: string;
}) {
  return useRecoilValue(remoteUsersMetadataSelector({ remoteUserIds, uuid }));
}
