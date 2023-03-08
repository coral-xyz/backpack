import { useRecoilValue } from "recoil";

import * as atoms from "../atoms";

export const useUnreadCount = () => {
  return useRecoilValue(atoms.unreadCount);
};
