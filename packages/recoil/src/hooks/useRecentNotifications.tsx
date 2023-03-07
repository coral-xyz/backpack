import { useRecoilValue } from "recoil";

import * as atoms from "../atoms";

export const useRecentNotifications = ({
  limit,
  offset,
  uuid,
}: {
  limit: number;
  offset: number;
  uuid: string;
}) => {
  return useRecoilValue(atoms.recentNotifications({ limit, offset, uuid }));
};
