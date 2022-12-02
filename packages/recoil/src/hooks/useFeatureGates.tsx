import { useRecoilValue } from "recoil";

import * as atoms from "../atoms";

export const useFeatureGates = () => {
  return useRecoilValue(atoms.featureGates);
};
