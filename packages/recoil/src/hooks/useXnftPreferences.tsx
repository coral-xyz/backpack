import { useRecoilValue } from "recoil";

import * as atoms from "../atoms";

export const useXnftPreferences = () => {
  return useRecoilValue(atoms.xnftPreferences);
};

export function useXnftPreference(xnftId?: string) {
  if (!xnftId) {
    return null;
  }
  return useRecoilValue(atoms.xnftPreference(xnftId));
}
