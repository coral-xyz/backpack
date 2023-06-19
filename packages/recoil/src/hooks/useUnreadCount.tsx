import { useRecoilState } from "recoil";

import * as atoms from "../atoms";

export const useUnreadCount = () => {
  return useRecoilState(atoms.unreadCount);
};
