import { recentNotifications } from "../atoms/notifications";
import { useRecoilValue } from "recoil";
import * as atoms from "../atoms";

export const useRecentNotifications = ({
  limit,
  offset,
}: {
  limit: number;
  offset: number;
}) => {
  return useRecoilValue(atoms.recentNotifications({ limit, offset }));
};
