import { useRecoilValue } from "recoil";

import * as atoms from "../atoms";

export const useXnftPreferences = () => {
  const user = useRecoilValue(atoms.secureUserAtom);
  return useRecoilValue(atoms.xnftPreferences(user.user.uuid));
};

export function useXnftPreference(xnftId?: string) {
  return useRecoilValue(atoms.xnftPreference(xnftId));
}
