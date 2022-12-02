import { useRecoilValue } from "recoil";

import * as atoms from "../atoms";
import { recentNotifications } from "../atoms/notifications";

export const useRecentNotifications = ({
  limit,
  offset,
}: {
  limit: number;
  offset: number;
}) => {
  return useRecoilValue(atoms.recentNotifications({ limit, offset }));
};
